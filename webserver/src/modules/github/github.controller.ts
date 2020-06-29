import { Controller, Get, Req, Query, Post, Body } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { GithubService } from './github.service';
import { UserService } from '../user/user.service';
import { GitActivityReqBody, WebHook } from './github.dto';

const getPathFromUrl = (url = '') => {
  return url.replace('https://github.com/', '');
};

@Controller('api/github')
export class GithubController {
  constructor(
    private readonly githubService: GithubService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @Get('/repo')
  async getRepo(@Req() req: Request, @Query('repo_url') repo_url: string) {
    const user = await this.userService.validateCookieUser(req);
    return this.githubService.getRepoInfo(
      user.git_token,
      getPathFromUrl(repo_url),
    );
  }

  @Post('/repo/hook')
  async setWebHook(@Req() req: Request, @Body() body: GitActivityReqBody) {
    const { git_token } = await this.userService.validateCookieUser(req);
    const repo_path = getPathFromUrl(body.repo_url);
    let repo_hooks: WebHook[] = await this.githubService.getWebHooks(
      git_token,
      repo_path,
    );
    if (repo_hooks.length) {
      repo_hooks = repo_hooks.filter(({ id, config: { url } }: WebHook) => {
        return url === this.configService.get<string>('github.webhook_url');
      });
    }
    if (repo_hooks.length > 1) {
      const dulplicated_ids = repo_hooks.map(hook => hook.id).splice(1);
      await this.githubService.deleteHooks(
        git_token,
        repo_path,
        dulplicated_ids,
      );
    }
    if (!repo_hooks.length) {
      return await this.githubService.createWebHook(
        git_token,
        repo_path,
        body.active,
      );
    } else {
      return await this.githubService.editWebHook(
        git_token,
        repo_path,
        repo_hooks[0].id,
        body.active,
      );
    }
  }

  @Post('/repo/deploy-key')
  async updateDeployKeyActivity(
    @Req() req: Request,
    @Body() body: GitActivityReqBody,
  ) {
    const { git_token } = await this.userService.validateCookieUser(req);
    const repo_path = getPathFromUrl(body.repo_url);
    const active = body.active;

    if (active) {
      return await this.githubService.addDeployKey(git_token, repo_path);
    } else {
      return await this.githubService.deleteDeployKey(git_token, repo_path);
    }
  }

  @Get('/branches')
  async getBranches(@Req() req: Request, @Query('repo_url') repo_url: string) {
    const { git_token } = await this.userService.validateCookieUser(req);
    const branches = await this.githubService.getRepoBranches(
      git_token,
      getPathFromUrl(repo_url),
    );
    return branches.map(branch => branch.name);
  }
}
