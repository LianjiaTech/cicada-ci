import { Module } from '@nestjs/common';
import { BuildTaskService } from './build-task.service';
import { BuildRecordModule } from '../build-record/build-record.module';
import { BuildRecordService } from '../build-record/build-record.service';
import EventBus, { BUILD_EVENTS } from '~/utils/event-bus';
import {
  BuildSuccessDto,
  BuildLogDto,
  BuildFailDto,
  BuildStartDto,
  BuildAbortDto,
  BuildTimeoutDto,
} from './build-task.dto';
import { BuildTaskController } from './build-task.controller';

@Module({
  imports: [BuildRecordModule],
  providers: [BuildTaskService],
  exports: [BuildTaskService],
  controllers: [BuildTaskController],
})
export class BuildTaskModule {
  constructor(private readonly buildRecordService: BuildRecordService) {
    this.registerEvents();
  }

  private registerEvents() {
    this.registerStartEvent();
    this.registerLogEvent();
    this.registerSuccessEvent();
    this.registerFailEvent();
    this.registerAbortEvent();
    this.registerTimeoutEvent();
  }

  private registerStartEvent() {
    EventBus.on(BUILD_EVENTS.START, ({ id, status }: BuildStartDto) => {
      this.buildRecordService.update(id, { status });
    });
  }

  private registerLogEvent() {
    EventBus.on(BUILD_EVENTS.LOG, ({ id, log }: BuildLogDto) => {
      this.buildRecordService.update(id, { log });
    });
  }

  private registerSuccessEvent() {
    EventBus.on(
      BUILD_EVENTS.SUCCESS,
      ({ id, job_id, ...successData }: BuildSuccessDto) => {
        this.buildRecordService.update(id, successData);
      },
    );
  }

  private registerFailEvent() {
    EventBus.on(
      BUILD_EVENTS.FAIL,
      ({ id, job_id, ...failData }: BuildFailDto) => {
        this.buildRecordService.update(id, failData);
      },
    );
  }

  private registerAbortEvent() {
    EventBus.on(
      BUILD_EVENTS.ABORT,
      ({ id, job_id, ...abortData }: BuildAbortDto) => {
        this.buildRecordService.update(id, abortData);
      },
    );
  }

  private registerTimeoutEvent() {
    EventBus.on(
      BUILD_EVENTS.TIMEOUT,
      ({ id, job_id, ...timeoutData }: BuildTimeoutDto) => {
        this.buildRecordService.update(id, timeoutData);
      },
    );
  }
}
