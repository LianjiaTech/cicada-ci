import { User } from './user';

export enum DeployStatus {
  INIT = '初始化',
  INQUEUE = '队列中',
  PROCESSING = '进行中',
  SUCCESS = '已完成',
  FAIL = '已失败',
  ABORT = '已取消',
  TIMEOUT = '已超时',
}

export interface DeployRecord {
  id: number;
  build_id: number;
  deployer_id: number;
  duration: number | string;
  status: DeployStatus;
  log?: string;
  create_user?: User;
  create_time?: string;
  update_time?: string;
  is_end?: boolean;
}
