import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { existsSync } from 'fs';
import { join } from 'path';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import databaseConfig from '~/db/config';
import gitlabConfig from '~/configs/gitlab';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HookModule } from './modules/hook/hook.module';
import { ProjectModule } from './modules/project/project.module';
import { JobModule } from './modules/job/job.module';
import { BuildRecordModule } from './modules/build-record/build-record.module';
import { BuildTaskModule } from './modules/build-task/build-task.module';
import { SocketModule } from './modules/socket/socket.module';
import { GithubModule } from './modules/github/github.module';
import { UserModule } from './modules/user/user.module';
import { QueueModule } from './modules/queue/queue.module';
import { DownloadModule } from './modules/download/download.module';
import { DeployRecordModule } from './modules/deploy-record/deploy-record.module';
import { DeployTaskModule } from './modules/deploy-task/deploy-task.module';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.env.PWD, envFilePath),
      load: [databaseConfig, gitlabConfig],
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
    HookModule,
    ProjectModule,
    JobModule,
    BuildRecordModule,
    BuildTaskModule,
    SocketModule,
    GithubModule,
    UserModule,
    QueueModule,
    DownloadModule,
    DeployRecordModule,
    DeployTaskModule,
    GitlabModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
