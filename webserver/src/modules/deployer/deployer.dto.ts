import { User } from '~/db/entities/user.entity';

export class DeployerBody {
  readonly project_id: number;
  readonly name: string;
  readonly scripts: string;
  readonly branch_filter: string;
}

export class CreateDeployerDto extends DeployerBody {
  create_user: User;
}

export class UpdateDeployerDto extends DeployerBody {
  update_user: User;
}
