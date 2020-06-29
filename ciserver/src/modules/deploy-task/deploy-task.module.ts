import { Module } from '@nestjs/common';
import { DeployTaskService } from './deploy-task.service';
import { DeployTaskController } from './deploy-task.controller';
import { DeployRecordService } from '../deploy-record/deploy-record.service';
import { BuildRecordModule } from '../build-record/build-record.module';
import { DeployRecordModule } from '../deploy-record/deploy-record.module';
import EventBus, { DEPLOY_EVENTS } from '~/utils/event-bus';
import {
  DeployStartDto,
  DeployLogDto,
  DeploySuccessDto,
  DeployFailDto,
  DeployAbortDto,
  DeployTimeoutDto,
} from './deploy-task.dto';
import { UserModule } from '../user/user.module';

@Module({
  imports: [DeployRecordModule, BuildRecordModule, UserModule],
  providers: [DeployTaskService],
  controllers: [DeployTaskController],
})
export class DeployTaskModule {
  constructor(private readonly deployRecordService: DeployRecordService) {
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
    EventBus.on(DEPLOY_EVENTS.START, ({ id, status }: DeployStartDto) => {
      this.deployRecordService.update(id, { status });
    });
  }

  private registerLogEvent() {
    EventBus.on(DEPLOY_EVENTS.LOG, ({ id, log }: DeployLogDto) => {
      this.deployRecordService.update(id, { log });
    });
  }

  private registerSuccessEvent() {
    EventBus.on(
      DEPLOY_EVENTS.SUCCESS,
      ({ id, build_id, ...successData }: DeploySuccessDto) => {
        this.deployRecordService.update(id, successData);
      },
    );
  }

  private registerFailEvent() {
    EventBus.on(
      DEPLOY_EVENTS.FAIL,
      ({ id, build_id, ...failData }: DeployFailDto) => {
        this.deployRecordService.update(id, failData);
      },
    );
  }

  private registerAbortEvent() {
    EventBus.on(
      DEPLOY_EVENTS.ABORT,
      ({ id, build_id, ...abortData }: DeployAbortDto) => {
        this.deployRecordService.update(id, abortData);
      },
    );
  }

  private registerTimeoutEvent() {
    EventBus.on(
      DEPLOY_EVENTS.TIMEOUT,
      ({ id, build_id, ...timeoutData }: DeployTimeoutDto) => {
        this.deployRecordService.update(id, timeoutData);
      },
    );
  }
}
