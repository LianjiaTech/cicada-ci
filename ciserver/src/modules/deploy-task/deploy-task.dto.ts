import { DeployStatus } from '~/db/entities/deploy-record.entity';
import { Deployer } from '~/db/entities/deployer.entity';

export class CreateDeployTaskBody {
  readonly build_id: number;
  readonly deployer: Deployer;
  readonly is_auto: boolean;
}

export class CreateDeployTaskDto {
  readonly id: number;
  readonly build_id: number;
  readonly project_id: number;
  readonly deploy_scripts: string;
}

export class DeployStartDto {
  readonly id: number;
  readonly build_id: number;
  readonly status: DeployStatus.PROCESSING;
}

export class DeployLogDto {
  readonly id: number;
  readonly log: string;
}

class DeployStatusDto {
  readonly id: number;
  readonly build_id: number;
  readonly log: string;
  readonly duration: number;
  readonly status: DeployStatus;
}

export class DeployFailDto extends DeployStatusDto {
  readonly status: DeployStatus.FAIL;
}

export class DeploySuccessDto extends DeployStatusDto {
  readonly status: DeployStatus.SUCCESS;
}

export class DeployAbortDto extends DeployStatusDto {
  readonly status: DeployStatus.ABORT;
}

export class DeployTimeoutDto extends DeployStatusDto {
  readonly status: DeployStatus.TIMEOUT;
}
