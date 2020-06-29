import { Injectable, HttpService, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { DeployKey } from './gitlab.dto';

@Injectable()
export class GitlabService {
  private host: string;
  private deployKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.host = this.configService.get<string>('gitlab.host');
    this.deployKey = this.configService.get<string>('gitlab.deploy_key');
  }

  private async gitlabRequest(config: AxiosRequestConfig) {
    const res = await this.httpService
      .request(config)
      .toPromise()
      .catch(err => {
        throw new HttpException(err, err.status || -1);
      });
    return res.data;
  }

  async getRepoInfo(access_token: string, repo_path: string) {
    return await this.gitlabRequest({
      url: `${this.host}/api/v4/projects/${repo_path}`,
      method: 'get',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
  }

  async getWebHooks(access_token: string, repo_path: string) {
    return await this.gitlabRequest({
      url: `${this.host}/api/v4/projects/${repo_path}/hooks`,
      method: 'get',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
  }

  async createWebHook(
    access_token: string,
    repo_path: string,
    active: boolean = true,
  ) {
    return await this.gitlabRequest({
      url: `${this.host}/api/v4/projects/${repo_path}/hooks`,
      method: 'post',
      data: {
        url: this.configService.get<string>('gitlab.webhook_url'),
      },
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
  }

  async deleteHooks(
    access_token: string,
    repo_path: string,
    hook_ids: number[],
  ) {
    if (!hook_ids.length) {
      return;
    }
    for (let i = 0; i < hook_ids.length; i++) {
      await this.gitlabRequest({
        url: `${this.host}/api/v4/projects/${repo_path}/hooks/${hook_ids[i]}`,
        method: 'delete',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
    }
  }

  async addDeployKey(access_token: string, repo_path: string) {
    return await this.gitlabRequest({
      url: `${this.host}/api/v4/projects/${repo_path}/deploy_keys`,
      method: 'post',
      data: {
        title: 'feci_open',
        key: this.deployKey,
      },
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
  }

  async deleteDeployKey(access_token: string, repo_path: string) {
    const keys: DeployKey[] = await this.gitlabRequest({
      url: `${this.host}/api/v4/projects/${repo_path}/deploy_keys`,
      method: 'get',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const feciKeys = keys.filter(({ key }) => key === this.deployKey);
    for (let i = 0; i < feciKeys.length; i++) {
      await this.gitlabRequest({
        url: `${this.host}/api/v4/projects/${repo_path}/deploy_keys/${feciKeys[i].id}`,
        method: 'delete',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
    }
  }

  async getRepoBranches(access_token: string, repo_path: string) {
    return await this.gitlabRequest({
      url: `${this.host}/api/v4/projects/${repo_path}/repository/branches?per_page=100`,
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
  }
}
