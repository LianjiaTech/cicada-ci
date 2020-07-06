import { Injectable, HttpException, Inject } from '@nestjs/common';
import * as Queue from 'bull';
import { Logger } from 'winston';
import { BuildRecordService } from '../build-record/build-record.service';
import { BuildStatus } from '~/db/entities/build-record.entity';
import { BuildTaskService } from '../build-task/build-task.service';
import EventBus, { BUILD_EVENTS } from '~/utils/event-bus';

@Injectable()
export class QueueService {
  constructor(
    private readonly buildRecordService: BuildRecordService,
    private readonly buildTaskService: BuildTaskService,
    @Inject('winston')
    private readonly logger: Logger,
  ) {
    this.registerTaskSuccessEvent();
    this.registerTaskFailEvent();
    this.registerTaskAbortEvent();
  }

  private pool: Map<number, Queue> = new Map();

  private getQueue(project_id: number): Queue {
    if (this.pool.has(project_id)) {
      return this.pool.get(project_id);
    }
    //todo redis env
    const queue = new Queue('project_' + project_id, {
      redis: {
        host: process.env.REDIS_HOST,
        port: 6379,
      },
    });
    this.registerProcess(queue);
    this.pool.set(project_id, queue);
    return queue;
  }

  private registerProcess(queue) {
    queue.process((job, done) => {
      this.logger.info(`process queue job ${queue.name} ${job.id}`);
      this.buildTaskService.start(+job.id);
      queue.processDone = done;
    });
  }

  private async getQueueFromId(id: number): Promise<Queue> {
    const buildRecord = await this.buildRecordService.querySingle(id);
    const project_id = buildRecord.project_id;
    return this.getQueue(project_id);
  }

  private async getJobById(id: number, queue: Queue) {
    this.logger.info('queue job get ' + id);
    return await queue.getJob(id);
  }

  //todo pass project_id for perf
  async add(id: number) {
    await this.buildRecordService.update(id, {
      status: BuildStatus.INQUEUE,
    });
    const queue = await this.getQueueFromId(id);
    const queueJob = await queue.getJob(id);
    if (queueJob) {
      this.logger.info('queue job retry ' + id);
      await queueJob.retry();
    } else {
      this.logger.info('queue job add ' + id);
      await queue.add({}, { jobId: id });
    }
  }

  //todo pass project_id for perf
  async remove(id: number) {
    this.logger.info('dequeue ' + id);
    const queue = await this.getQueueFromId(id);
    const job = await queue.getJob(id);
    await this.buildRecordService.update(id, {
      status: BuildStatus.INIT,
    });
    if (!job) {
      throw new HttpException({ message: 'queue job not found' }, 404);
    }
    const isWaiting = await job.isWaiting();
    if (isWaiting) {
      await job.remove();
    } else {
      throw new HttpException(
        { message: 'the queue job is not in waiting' },
        400,
      );
    }
  }

  private async queueJobEnd(id: number, isFail = false) {
    const queue = await this.getQueueFromId(id);
    const job = await this.getJobById(id, queue);
    this.logger.info('queue job end ' + job.id);
    const isActive = await job.isActive();
    if (isActive) {
      queue.processDone(isFail ? new Error('') : '');
    }
  }

  registerTaskSuccessEvent() {
    EventBus.on(BUILD_EVENTS.SUCCESS, async ({ id }: { id: number }) => {
      this.queueJobEnd(id);
    });
  }

  registerTaskFailEvent() {
    EventBus.on(BUILD_EVENTS.FAIL, async ({ id }: { id: number }) => {
      this.queueJobEnd(id, true);
    });
  }

  registerTaskAbortEvent() {
    EventBus.on(BUILD_EVENTS.ABORT, async ({ id }: { id: number }) => {
      this.queueJobEnd(id, true);
    });
  }
}
