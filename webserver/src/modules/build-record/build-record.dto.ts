import { BuildStatus } from '~/db/entities/build-record.entity';
import { GitFrom } from '~/db/entities/user.entity';

export class BuildRecordListFilter {
  project_id: number;
  job_id: number;
}

export class BuildRecordStatsDto {
  project_id?: number;
  git_from: GitFrom;
}

export class BuildRecordRangeStatsDto extends BuildRecordStatsDto {
  start_date: string;
  end_date: string;
}

export class ProjectRankingStatsDto {
  start_date: string;
  end_date: string;
  rank_status: BuildStatus;
  git_from: GitFrom;
}
