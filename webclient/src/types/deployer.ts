import { User } from './user';

export interface BasicDeployerConfig {
  project_id: number;
  name: string;
  scripts: string;
  branch_filter: string;
}

export interface Deployer extends BasicDeployerConfig {
  id: number;
  create_user?: User;
  update_user?: User;
  create_time?: string;
  update_time?: string;
}
