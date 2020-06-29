import { Injectable, HttpService, HttpException } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { GithubBranchDto } from './github.dto';
import { GithubCommit } from '~/db/entities/build-record.entity';

const getPathFromUrl = (url = '') => {
  return url.replace('https://github.com/', '');
};

@Injectable()
export class GithubService {
  constructor(private readonly httpService: HttpService) {}

  private async githubRequest(config: AxiosRequestConfig) {
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
  ): Promise<GithubCommit> {
    const repo_path = getPathFromUrl(repo_url);
    const res: GithubBranchDto = await this.githubRequest({
      url: `https://api.github.com/repos/${repo_path}/branches/${branch}`,
      method: 'get',
      headers: {
        Authorization: `token ${access_token}`,
      },
    });

    return {
      id: res.commit.sha,
      tree_id: res.commit.commit.tree.sha,
      message: res.commit.commit.message,
      author: res.commit.commit.author,
      committer: res.commit.commit.commiter,
    };
  }
}
