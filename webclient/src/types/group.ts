import { Project } from './project';
import { User } from './user';

export interface CreateGroupConfig {
  name: string;
  admins: User[];
}

export interface Group extends CreateGroupConfig {
  id: number;
  projects: Project[];
  create_user?: User;
  update_user?: User;
  create_time?: string;
  update_time?: string;
}

export interface GroupBasic {
  id: number;
  name: string;
}

export interface GroupsWithCount {
  total: number;
  results: Group[];
}
