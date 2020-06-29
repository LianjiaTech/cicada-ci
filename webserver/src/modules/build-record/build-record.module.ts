import { Module } from '@nestjs/common';
import { BuildRecordService } from './build-record.service';
import { BuildRecordController } from './build-record.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuildRecord } from '~/db/entities/build-record.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([BuildRecord]), UserModule],
  providers: [BuildRecordService],
  controllers: [BuildRecordController],
})
export class BuildRecordModule {}
