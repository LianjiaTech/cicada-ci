import { User } from '~/db/entities/user.entity';

export class BuilderBody {
  readonly project_id: number;
  readonly name: string;
  readonly install_scripts: string;
  readonly build_scripts: string;
}

export class CreateBuilderDto extends BuilderBody {
  create_user: User;
}

export class UpdateBuilderDto extends BuilderBody {
  update_user: User;
}
