export interface PackageSize {
  package_name: string;
  size: number | string;
  download_url?: string;
}

export enum BuildStatus {
  INIT = '初始化',
  INQUEUE = '队列中',
  PROCESSING = '进行中',
  SUCCESS = '已完成',
  FAIL = '已失败',
  ABORT = '已取消',
  TIMEOUT = '已超时',
}

export interface BuildRecord {
  id: number;
  project_id: number;
  job_id: number;
  branch: string;
  commits: object[];
  commitor: string;
  source: string;
  duration: number | string;
  package_sizes: PackageSize[];
  status: BuildStatus;
  log?: string;
  create_time?: string;
  update_time?: string;
}

export interface BuildRecordsWithCount {
  total: number;
  results: BuildRecord[];
}

export interface BuildRecordsFilter {
  project_id: number;
  job_id: number;
}
