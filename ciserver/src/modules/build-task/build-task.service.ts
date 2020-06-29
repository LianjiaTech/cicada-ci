import { Injectable } from '@nestjs/common';
import { BuildTaskFactory } from './build-task.factory';
import { BuildRecordService } from '../build-record/build-record.service';

@Injectable()
export class BuildTaskService {
  constructor(private readonly buildRecordService: BuildRecordService) {}

  async start(id: number) {
    const {
      branch,
      project,
      job,
      commits,
    } = await this.buildRecordService.querySingle(id);

    const task = BuildTaskFactory.getTask({
      id,
      branch,
      project,
      job,
      commit: commits[0],
    });
    task.start();
  }

  async abort(id: number) {
    const {
      branch,
      project,
      job,
      commits,
    } = await this.buildRecordService.querySingle(id);

    const task = BuildTaskFactory.getTask({
      id,
      branch,
      project,
      job,
      commit: commits[0],
    });
    task.abort();
  }
}
