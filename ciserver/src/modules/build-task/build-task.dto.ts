import { PackageSize, BuildStatus } from '~/db/entities/build-record.entity';

export class BuildStartDto {
  readonly id: number;
  readonly job_id: number;
  readonly status: BuildStatus.PROCESSING;
}

export class BuildLogDto {
  readonly id: number;
  readonly log: string;
}

class BuildStatusDto {
  readonly id: number;
  readonly job_id: number;
  readonly log: string;
  readonly duration: number;
  readonly status: BuildStatus;
}

export class BuildFailDto extends BuildStatusDto {
  readonly status: BuildStatus.FAIL;
}

export class BuildSuccessDto extends BuildStatusDto {
  readonly package_sizes: PackageSize[];
  readonly status: BuildStatus.SUCCESS;
}

export class BuildAbortDto extends BuildStatusDto {
  readonly status: BuildStatus.ABORT;
}

export class BuildTimeoutDto extends BuildStatusDto {
  readonly status: BuildStatus.TIMEOUT;
}
