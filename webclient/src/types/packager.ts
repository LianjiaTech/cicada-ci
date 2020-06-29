import { User } from './user';

export interface BasicPackagerConfig {
  project_id: number;
  package_name: string;
  dist_path: string;
}

export interface Packager extends BasicPackagerConfig {
  id: number;
  create_user?: User;
  update_user?: User;
  create_time?: string;
  update_time?: string;
}
