import {
  Module,
  NestModule,
  HttpModule,
  RequestMethod,
  MiddlewareConsumer,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { existsSync } from 'fs';
import { join } from 'path';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import databaseConfig from '~/db/config';
import githubConfig from '~/configs/github';
import gitlabConfig from '~/configs/gitlab';
import { ClientProxyMiddleware } from './common/middleware/client-proxy.middleware';
import { UserModule } from './modules/user/user.module';
import { OauthModule } from './modules/oauth/oauth.module';
import { ProjectModule } from './modules/project/project.module';
import { GithubModule } from './modules/github/github.module';
import { GroupModule } from './modules/group/group.module';
import { BuilderModule } from './modules/builder/builder.module';
import { PackagerModule } from './modules/packager/packager.module';
import { DeployerModule } from './modules/deployer/deployer.module';
import { JobModule } from './modules/job/job.module';
import { BuildRecordModule } from './modules/build-record/build-record.module';
import { DeployRecordModule } from './modules/deploy-record/deploy-record.module';
import { GitlabModule } from './modules/gitlab/gitlab.module';

const isDevelopment =
  !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
//handle envFilePath, use dotenv-flow if nestjs support in configmodule
let envFilePath = `.env.${process.env.NODE_ENV}`;
const envLocalFilePath = `.env.${process.env.NODE_ENV}.local`;
if (existsSync(join(process.env.PWD, envLocalFilePath))) {
  envFilePath = envLocalFilePath;
}
if (!existsSync(join(process.env.PWD, envFilePath))) {
  envFilePath = '.env.development';
}

let imports = [
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: join(process.env.PWD, envFilePath),
    load: [databaseConfig, githubConfig, gitlabConfig],
  }),
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
      entities: [__dirname + '/db/entities/*.entity{.ts,.js}'],
      type: 'mysql',
      charset: 'UTF8MB4_GENERAL_CI',
      host: configService.get<string>('database.host'),
      port: configService.get<number>('database.port'),
      username: configService.get<string>('database.username'),
      password: configService.get<string>('database.password'),
      database: configService.get<string>('database.name'),
    }),
    inject: [ConfigService],
  }),
  WinstonModule.forRoot({
    transports: [
      isDevelopment
        ? new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              nestWinstonModuleUtilities.format.nestLike(),
            ),
          })
        : new winston.transports.DailyRotateFile({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '30d',
            format: winston.format.combine(
              winston.format.timestamp(),
              nestWinstonModuleUtilities.format.nestLike(),
            ),
          }),
    ],
  }),
  HttpModule,
  UserModule,
  OauthModule,
  ProjectModule,
  GithubModule,
  GitlabModule,
  GroupModule,
  BuilderModule,
  PackagerModule,
  DeployerModule,
  JobModule,
  BuildRecordModule,
  DeployRecordModule,
];

//static-module for non-dev env
if (!isDevelopment) {
  imports.push(
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'client'),
      exclude: ['/api*', '/oauth*'],
      serveStaticOptions: {
        maxAge: 8.64e7,
      },
    }),
  );
}

@Module({
  imports,
  controllers: [AppController],
})
export class AppModule implements NestModule {
  constructor(private readonly connection: Connection) {}
  configure(consumer: MiddlewareConsumer) {
    //proxy for dev env
    if (isDevelopment) {
      consumer
        .apply(ClientProxyMiddleware)
        .forRoutes(
          { path: '/*', method: RequestMethod.GET },
          { path: '/*', method: RequestMethod.POST },
        );
    }
  }
}
