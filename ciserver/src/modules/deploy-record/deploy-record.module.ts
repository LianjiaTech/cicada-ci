import { Module } from '@nestjs/common';
import { DeployRecordService } from './deploy-record.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeployRecord } from '~/db/entities/deploy-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeployRecord])],
  providers: [DeployRecordService],
  exports: [DeployRecordService],
})
export class DeployRecordModule {}
