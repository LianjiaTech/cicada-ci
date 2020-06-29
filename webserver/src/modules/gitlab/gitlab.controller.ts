import { Controller, Get, Req, Query, Post, Body } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { GitlabService } from './gitlab.service';
import { UserService } from '../user/user.service';
import { GitActivityReqBody, WebHook } from './gitlab.dto';

@Controller('api/gitlab')
export class GitlabController {
  private gitlabHost: string;

  constructor(
    private readonly gitlabService: GitlabService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    this.gitlabHost = this.configService.get<string>('gitlab.host');
  }

  private getPathFromUrl = (url = '') => {
    return encodeURIComponent(
      url.replace(`${this.gitlabHost}/`, '').replace('.git', ''),
    );
  };

  @Get('/repo')
  async getRepo(@Req() req: Request, @Query('repo_url') repo_url: string) {
    const user = await this.userService.validateCookieUser(req);
    return this.gitlabService.getRepoInfo(
      user.git_token,
      this.getPathFromUrl(repo_url),
    );
  }

  @Post('/repo/hook')
  async updateWebHookActivity(
    @Req() req: Request,
    @Body() body: GitActivityReqBody,
  ) {
    const { git_token } = await this.userService.validateCookieUser(req);
    const repo_path = this.getPathFromUrl(body.repo_url);
    let repo_hooks: WebHook[] = await this.gitlabService.getWebHooks(
      git_token,
      repo_path,
    );
    if (repo_hooks.length) {
      repo_hooks = repo_hooks.filter(({ id, url }: WebHook) => {
        return url === this.configService.get<string>('gitlab.webhook_url');
      });
    }
    if (repo_hooks.length > 1) {
      const dulplicated_ids = repo_hooks.map(hook => hook.id).splice(1);
      await this.gitlabService.deleteHooks(
        git_token,
        repo_path,
        dulplicated_ids,
      );
    }
    if (!repo_hooks.length && body.active) {
      return await this.gitlabService.createWebHook(
        git_token,
        repo_path,
        body.active,
      );
    } else if (repo_hooks.length && !body.active) {
      return await this.gitlabService.deleteHooks(git_token, repo_path, [
        repo_hooks[0].id,
      ]);
    } else {
      return 'ok';
    }
  }

  @Post('/repo/deploy-key')
  async updateDeployKeyActivity(
    @Req() req: Request,
    @Body() body: GitActivityReqBody,
  ) {
    const { git_token } = await this.userService.validateCookieUser(req);
    const repo_path = this.getPathFromUrl(body.repo_url);
    const active = body.active;

    if (active) {
      return await this.gitlabService.addDeployKey(git_token, repo_path);
    } else {
      return await this.gitlabService.deleteDeployKey(git_token, repo_path);
    }
  }

  @Get('/branches')
  async getBranches(@Req() req: Request, @Query('repo_url') repo_url: string) {
    const { git_token } = await this.userService.validateCookieUser(req);
    const branches = await this.gitlabService.getRepoBranches(
      git_token,
      this.getPathFromUrl(repo_url),
    );
    return branches.map(branch => branch.name);
  }
}
