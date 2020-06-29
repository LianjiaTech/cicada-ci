export interface BuildRecordSummaryCount {
  job_id?: number;
  count_total: number;
  count_success: number;
  count_cache: number;
  count_fail: number;
  count_timeout: number;
}

export interface BuildRecordDailyCount {
  count_success: number;
  count_fail: number;
  date: string;
}

export interface ProjectRankingItem {
  project_id: number;
  project_name: string;
  count: number;
}
