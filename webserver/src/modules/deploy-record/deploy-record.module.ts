import { Module } from '@nestjs/common';
import { DeployRecordService } from './deploy-record.service';
import { DeployRecordController } from './deploy-record.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeployRecord } from '~/db/entities/deploy-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeployRecord])],
  providers: [DeployRecordService],
  controllers: [DeployRecordController],
})
export class DeployRecordModule {}
