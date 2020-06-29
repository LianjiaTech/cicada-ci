import { User } from './user';
import { GroupBasic } from './group';

export interface CreateProjectConfig {
  name: string;
  repo_url: string;
  ssh_url: string;
  clone_with_ssh: boolean;
  repo_id: number;
  enable_webhook: boolean;
  group: GroupBasic;
  admins: User[];
  adv_configs: {
    install_type: number;
    enable_deps_cache: boolean;
  };
}

export interface Project extends CreateProjectConfig {
  id: number;
  create_user?: User;
  update_user?: User;
  create_time?: string;
  update_time?: string;
}

export interface UpdateProjectConfig {
  name: string;
  clone_with_ssh: boolean;
  enable_webhook: boolean;
  group: GroupBasic;
  admins: User[];
  adv_configs: {
    install_type: number;
    enable_deps_cache: boolean;
  };
}

export interface ProjectsWithCount {
  total: number;
  results: Project[];
}

export interface ProjectFilter {
  keywords: string;
  created: boolean;
}
