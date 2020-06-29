import { User } from '~/db/entities/user.entity';

export class PackagerBody {
  readonly project_id: number;
  readonly package_name: string;
  readonly dist_path: string;
}

export class CreatePackagerDto extends PackagerBody {
  create_user: User;
}

export class UpdatePackagerDto extends PackagerBody {
  update_user: User;
}
