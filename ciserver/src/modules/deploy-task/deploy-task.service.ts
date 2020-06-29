import { Injectable } from '@nestjs/common';
import { CreateDeployTaskDto } from './deploy-task.dto';
import { DeployTaskFactory } from './deploy-task.factory';

@Injectable()
export class DeployTaskService {
  constructor() {}

  async create({
    id,
    build_id,
    project_id,
    deploy_scripts,
  }: CreateDeployTaskDto) {
    const task = DeployTaskFactory.getTask({
      id,
      build_id,
      project_id,
      deploy_scripts,
    });
    task.start();
  }

  // async abort(id: number) {
  //   const {
  //     branch,
  //     project,
  //     job,
  //     commits,
  //   } = await this.buildRecordService.querySingle(id);

  //   const task = BuildTaskFactory.getTask({
  //     id,
  //     branch,
  //     project,
  //     job,
  //     commit: commits[0],
  //   });
  //   task.abort();
  // }
}
