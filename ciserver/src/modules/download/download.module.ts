import { Module } from '@nestjs/common';
import { DownloadController } from './download.controller';
import { BuildRecordModule } from '../build-record/build-record.module';

@Module({
  imports: [BuildRecordModule],
  controllers: [DownloadController],
})
export class DownloadModule {}
