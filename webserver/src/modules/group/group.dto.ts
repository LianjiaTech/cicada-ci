import { Project } from '~/db/entities/project.entity';
import { User } from '~/db/entities/user.entity';

export class GroupBody {
  readonly name: string;
  readonly projects: Project[];
  readonly admins: User[];
}

export class CreateGroupDto extends GroupBody {
  create_user: User;
}

export class UpdateGroupDto extends GroupBody {
  update_user: User;
}
