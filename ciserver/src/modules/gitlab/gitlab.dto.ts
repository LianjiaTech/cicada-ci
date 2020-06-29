import { GitlabCommit } from '~/db/entities/build-record.entity';

export class GitlabBranchDto {
  name: string;
  commit: GitlabCommit;
}
