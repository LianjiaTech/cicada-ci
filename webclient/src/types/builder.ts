import { User } from './user';

export interface BasicBuilderConfig {
  project_id: number;
  name: string;
  install_scripts: string;
  build_scripts: string;
}

export interface Builder extends BasicBuilderConfig {
  id: number;
  create_user?: User;
  update_user?: User;
  create_time?: string;
  update_time?: string;
}
