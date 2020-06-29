import { Controller, Post, Body, Req } from '@nestjs/common';
import { DeployTaskService } from './deploy-task.service';
import { DeployRecordService } from '../deploy-record/deploy-record.service';
import { BuildRecordService } from '../build-record/build-record.service';
import { CreateDeployTaskBody } from './deploy-task.dto';
import { DeployStatus } from '~/db/entities/deploy-record.entity';
import { UserService } from '../user/user.service';
import { Request } from 'express';

@Controller('deploy-task')
export class DeployTaskController {
  constructor(
    private readonly buildRecordService: BuildRecordService,
    private readonly deployRecordService: DeployRecordService,
    private readonly userService: UserService,
    private readonly deployTaskService: DeployTaskService,
  ) {}

  @Post('create')
  async create(
    @Body() { build_id, deployer, is_auto }: CreateDeployTaskBody,
    @Req() req: Request,
  ) {
    const user = await this.userService.validateCookieUser(req);
    const buildRecord = await this.buildRecordService.querySingle(build_id);
    const deployRecord = await this.deployRecordService.create({
      buildRecord,
      deployer,
      is_auto,
      status: DeployStatus.INIT,
      create_user: user,
    });
    await this.deployTaskService.create({
      id: deployRecord.id,
      build_id: buildRecord.id,
      project_id: buildRecord.project_id,
      deploy_scripts: deployer.scripts,
    });
    return 'ok';
  }
}
