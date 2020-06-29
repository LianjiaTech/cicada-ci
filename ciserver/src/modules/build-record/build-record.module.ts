import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuildRecord } from '~/db/entities/build-record.entity';
import { BuildRecordService } from './build-record.service';

@Module({
  imports: [TypeOrmModule.forFeature([BuildRecord])],
  providers: [BuildRecordService],
  exports: [BuildRecordService],
})
export class BuildRecordModule {}
