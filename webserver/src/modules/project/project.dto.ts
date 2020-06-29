import { IsBooleanString } from 'class-validator';
import { User, GitFrom } from '~/db/entities/user.entity';
import { Group } from '~/db/entities/group.entity';

export class CreateProjectBody {
  readonly name: string;
  readonly repo_url: string;
  readonly ssh_url: string;
  readonly clone_with_ssh: boolean;
  readonly repo_id: number;
  readonly enable_webhook: boolean;
  readonly group: Group;
  readonly admins: User[];
  readonly adv_configs: {
    install_type: number;
    enable_deps_cache: boolean;
  };
}

export class CreateProjectDto extends CreateProjectBody {
  create_user: User;
  git_from: GitFrom;
}

export class UpdateProjectBody {
  readonly name?: string;
  readonly clone_with_ssh?: boolean;
  readonly enable_webhook?: boolean;
  readonly group?: Group;
  readonly admins?: User[];
  readonly adv_configs?: {
    install_type: number;
    enable_deps_cache: boolean;
  };
}

export class UpdateProjectDto extends UpdateProjectBody {
  update_user: User;
}

export class ProjectListFilter {
  keywords: string;
  git_from?: GitFrom;

  @IsBooleanString()
  created;
}
