import { BuildRecord } from '~/db/entities/build-record.entity';
import { Deployer } from '~/db/entities/deployer.entity';
import { DeployStatus } from '~/db/entities/deploy-record.entity';
import { User } from '~/db/entities/user.entity';

export class CreateDeployRecordBody {
  buildRecord: BuildRecord;
  deployer: Deployer;
  status: DeployStatus;
  is_auto: boolean;
}

export class CreateDeployRecordDto extends CreateDeployRecordBody {
  create_user: User;
}

export class UpdateDeployRecordDto {
  log?: string;
  status?: DeployStatus;
  duration?: number;
}
