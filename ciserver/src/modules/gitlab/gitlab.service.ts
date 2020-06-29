import { Injectable, HttpService, HttpException } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { GitlabBranchDto } from './gitlab.dto';
import { GitlabCommit } from '~/db/entities/build-record.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GitlabService {
  private gitlabHost: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.gitlabHost = this.configService.get<string>('gitlab.host');
  }

  private getPathFromUrl = (url = '') => {
    return encodeURIComponent(
      url.replace(`${this.gitlabHost}/`, '').replace('.git', ''),
    );
  };

  private async gitlabRequest(config: AxiosRequestConfig) {
    const res = await this.httpService
      .request(config)
      .toPromise()
      .catch(err => {
        throw new HttpException(err, err.status || -1);
      });
    return res.data;
  }

  async getCommitFromBranch(
    access_token: string,
    repo_url: string,
    branch: string,
  ): Promise<GitlabCommit> {
    const repo_path = this.getPathFromUrl(repo_url);
    const res: GitlabBranchDto = await this.gitlabRequest({
      url: `${this.gitlabHost}/api/v4/projects/${repo_path}/repository/branches/${branch}`,
      method: 'get',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return res.commit;
  }
}
