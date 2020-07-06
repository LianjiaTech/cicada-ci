import { Injectable, HttpService, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { DeployKey } from './github.dto';

@Injectable()
export class GithubService {
  private deployKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.deployKey = this.configService.get<string>('github.deploy_key');
  }

  private async githubRequest(config: AxiosRequestConfig) {
    const res = await this.httpService
      .request(config)
      .toPromise()
      .catch(err => {
        console.log('errrr', config);
        throw new HttpException(err, err.status || -1);
      });
    return res.data;
  }

  async getRepoInfo(access_token: string, repo_path: string) {
    return await this.githubRequest({
      url: `https://api.github.com/repos/${repo_path}`,
      method: 'get',
      headers: {
        Authorization: `token ${access_token}`,
      },
    });
  }

  async getWebHooks(access_token: string, repo_path: string) {
    return await this.githubRequest({
      url: `https://api.github.com/repos/${repo_path}/hooks`,
      method: 'get',
      headers: {
        Authorization: `token ${access_token}`,
      },
    }).catch(err => {
      throw new HttpException(
        { message: '授权失败或项目不存在，通常出现在设置非本人创建项目时' },
        404,
      );
    });
  }

  async createWebHook(
    access_token: string,
    repo_path: string,
    active: boolean = true,
  ) {
    return await this.githubRequest({
      url: `https://api.github.com/repos/${repo_path}/hooks`,
      method: 'post',
      data: {
        name: 'web',
        active,
        events: ['push'],
        config: {
          url: this.configService.get<string>('github.webhook_url'),
          content_type: 'json',
          insecure_ssl: '0',
        },
      },
      headers: {
        Authorization: `token ${access_token}`,
      },
    });
  }

  async editWebHook(
    access_token: string,
    repo_path: string,
    hook_id: number,
    active: boolean = true,
  ) {
    return await this.githubRequest({
      url: `https://api.github.com/repos/${repo_path}/hooks/${hook_id}`,
      method: 'patch',
      data: {
        active,
      },
      headers: {
        Authorization: `token ${access_token}`,
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
      await this.githubRequest({
        url: `https://api.github.com/repos/${repo_path}/hooks/${hook_ids[i]}`,
        method: 'delete',
        headers: {
          Authorization: `token ${access_token}`,
        },
      });
    }
  }

  private getDeployKeys(
    access_token: string,
    repo_path: string,
  ): Promise<DeployKey[]> {
    return this.githubRequest({
      url: `https://api.github.com/repos/${repo_path}/keys`,
      method: 'get',
      headers: {
        Authorization: `token ${access_token}`,
      },
    });
  }

  async addDeployKey(access_token: string, repo_path: string) {
    const keys: DeployKey[] = await this.getDeployKeys(access_token, repo_path);
    const feciKeys = keys.filter(({ key }) => this.deployKey.includes(key));
    if (feciKeys.length) {
      return 'already exist';
    }
    return await this.githubRequest({
      url: `https://api.github.com/repos/${repo_path}/keys`,
      method: 'post',
      data: {
        title: 'feci_open',
        key: this.deployKey,
        read_only: true, //ci only need read scope
      },
      headers: {
        Authorization: `token ${access_token}`,
      },
    });
  }

  async deleteDeployKey(access_token: string, repo_path: string) {
    const keys: DeployKey[] = await this.getDeployKeys(access_token, repo_path);
    //github store keys without comment part at the end
    const feciKeys = keys.filter(({ key }) => this.deployKey.includes(key));
    for (let i = 0; i < feciKeys.length; i++) {
      await this.githubRequest({
        url: `https://api.github.com/repos/${repo_path}/keys/${feciKeys[i].id}`,
        method: 'delete',
        headers: {
          Authorization: `token ${access_token}`,
        },
      });
    }
  }

  async getRepoBranches(access_token: string, repo_path: string) {
    return await this.githubRequest({
      url: `https://api.github.com/repos/${repo_path}/branches`,
      headers: {
        Authorization: `token ${access_token}`,
      },
    });
  }
}
