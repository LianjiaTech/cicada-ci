import { Module } from '@nestjs/common';
import { BuilderService } from './builder.service';
import { BuilderController } from './builder.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Builder } from '~/db/entities/builder.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Builder]), UserModule],
  providers: [BuilderService],
  controllers: [BuilderController],
})
export class BuilderModule {}
