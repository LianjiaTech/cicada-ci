import { GithubCommit } from '~/db/entities/build-record.entity';

export class GithubWebhookDto {
  ref: string;
  repository: {
    id: number;
    full_name: string;
    html_url: string;
  };
  commits: GithubCommit[];
}

export class GitlabWebhookDto {
  ref: string;
  project_id: number;
  checkout_sha: string;
  commits: GithubCommit[];
}

export class ManualCreateDto {
  readonly job_id: number;
  readonly branch: string;
  readonly from: string;
}
