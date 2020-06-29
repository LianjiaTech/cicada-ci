import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { BuildTaskModule } from '../build-task/build-task.module';
import { QueueController } from './queue.controller';
import { BuildRecordModule } from '../build-record/build-record.module';

@Module({
  imports: [BuildTaskModule, BuildRecordModule],
  providers: [QueueService],
  controllers: [QueueController],
  exports: [QueueService],
})
export class QueueModule {}
