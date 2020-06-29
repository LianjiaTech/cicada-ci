import { Project } from '~/db/entities/project.entity';
import { User } from '~/db/entities/user.entity';
import { Builder } from '~/db/entities/builder.entity';
import { Packager } from '~/db/entities/packager.entity';
import { Deployer } from '~/db/entities/deployer.entity';

export class JobBody {
  readonly name: string;
  readonly project: Project;
  readonly branches: string[];
  readonly builder: Builder;
  readonly packagers: Packager[];
  readonly deployers: Deployer[];
  readonly auto_build: boolean;
  readonly auto_deploy: boolean;
  readonly after_build_hook: string;
  readonly after_deploy_hook: string;
  readonly disable_cache: boolean;
}

export class CreateJobDto extends JobBody {
  create_user: User;
}

export class UpdateJobDto extends JobBody {
  update_user: User;
}

export class JobListFilter {
  project_id: number;
}
