import { User } from './user';
import { Builder } from './builder';
import { Deployer } from './deployer';
import { Packager } from './packager';

export interface JobConfig {
  name: string;
  project: { id: number };
  branches: string[];
  builder: Builder;
  packagers: Packager[];
  deployers: Deployer[];
  auto_build: boolean;
  auto_deploy: boolean;
  after_build_hook: string;
  after_deploy_hook: string;
  disable_cache: boolean;
}

export interface Job extends JobConfig {
  id: number;
  create_user?: User;
  update_user?: User;
  create_time?: string;
  update_time?: string;
}

export interface JobListFilter {
  project_id: number;
}
