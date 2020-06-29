import { Controller, Get, Query, Res, Inject } from '@nestjs/common';
import { Response } from 'express';
import { Logger } from 'winston';
import { OauthService } from './oauth.service';
import { StringDict } from './oauth.dto';
import { UserService } from '~/modules/user/user.service';
import { getSign } from '~/utils';
import { User } from '~/db/entities/user.entity';

const setUserCookie = (res: Response, user: User) => {
  const { git_token, ...userVisibleInfo } = user;
  res.cookie(
    'user',
    JSON.stringify(
      Object.assign({}, userVisibleInfo, {
        sign: getSign(user), // 前端不显示token，只返回校验用sign
      }),
    ),
    {
      expires: new Date(Date.now() + 8.64e7 * 7),
    },
  );
};

@Controller('oauth')
export class OauthController {
  constructor(
    private readonly oauthService: OauthService,
    private readonly userService: UserService,
    @Inject('winston')
    private readonly logger: Logger,
  ) {}

  @Get('github/authurl')
  githubAuthUrl(@Query('state') state: string): string {
    return this.oauthService.getGithubAuthUrl(state);
  }

  @Get('github/callback')
  async githubCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const tokenResult = await this.oauthService
      .exchangeGithubAccessToken(code, state)
      .catch(err => {
        this.logger.error(err.toString());
        return res.redirect('/login?errorMsg=' + err.toString());
      });
    if (tokenResult && tokenResult.access_token) {
      const userInfo = await this.oauthService
        .getGithubUserInfo(tokenResult.access_token)
        .catch(err => {
          this.logger.error(err.toString());
          return res.redirect('/login?errorMsg=' + err.toString());
        });
      if ((userInfo as StringDict).login) {
        const user = await this.userService.testLogin({
          account:
            (userInfo as StringDict).email ||
            (userInfo as StringDict).login + '(no public email)',
          name: (userInfo as StringDict).login,
          git_token: tokenResult.access_token,
          from: 'github',
        });
        if (user.id) {
          setUserCookie(res, user);
          return res.redirect(state ? decodeURIComponent(state) : '/');
        }
      }
    }
    return res.redirect('/');
  }

  @Get('gitlab/authurl')
  gitlabAuthUrl(@Query('state') state: string): string {
    return this.oauthService.getGitlabAuthUrl(state);
  }

  @Get('gitlab/callback')
  async gitlabCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const tokenResult = await this.oauthService
      .exchangeGitlabAccessToken(code, state)
      .catch(err => {
        this.logger.error(err.toString());
        return res.redirect('/login?errorMsg=' + err.toString());
      });
    if (tokenResult && tokenResult.access_token) {
      const userInfo = await this.oauthService
        .getGitlabUserInfo(tokenResult.access_token)
        .catch(err => {
          this.logger.error(err.toString());
          return res.redirect('/login?errorMsg=' + err.toString());
        });
      if ((userInfo as StringDict).username) {
        const user = await this.userService.testLogin({
          account: (userInfo as StringDict).username,
          name: (userInfo as StringDict).name,
          git_token: tokenResult.access_token,
          from: 'gitlab',
        });
        if (user.id) {
          setUserCookie(res, user);
          return res.redirect(state ? decodeURIComponent(state) : '/');
        }
      }
    }
    return res.redirect('/');
  }
}
