import { Project } from '~/db/entities/project.entity';
import { Job } from '~/db/entities/job.entity';
import {
  GithubCommit,
  BuildStatus,
  PackageSize,
  BuildRecordExtra,
} from '~/db/entities/build-record.entity';

export class CreateBuildRecordDto {
  project: Project;
  job: Job;
  branch: string;
  commits: GithubCommit[];
  status: BuildStatus;
  source: string;
}

export class UpdateBuildRecordDto {
  status?: BuildStatus;
  duration?: number;
  package_sizes?: PackageSize[];
  log?: string;
  extra?: BuildRecordExtra;
}
