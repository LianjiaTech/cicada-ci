import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { URL, URLSearchParams } from 'url';
import { StringDict } from './oauth.dto';

@Injectable()
export class OauthService {
  private gitlabHost: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.gitlabHost = this.configService.get<string>('gitlab.host');
  }

  getGithubAuthUrl(state: string): string {
    const client_id = this.configService.get<string>('github.oauth_client_id');
    const redirect_uri = this.configService.get<string>(
      'github.oauth_redirect_uri',
    );
    let url = new URL('https://github.com/login/oauth/authorize');
    url.search = new URLSearchParams({
      client_id,
      redirect_uri,
      scope: 'user repo',
      state,
    }).toString();
    return url.toString();
  }

  async exchangeGithubAccessToken(
    code: string,
    state: string,
  ): Promise<StringDict> {
    const client_id = this.configService.get<string>('github.oauth_client_id');
    const redirect_uri = this.configService.get<string>(
      'github.oauth_redirect_uri',
    );
    const client_secret = this.configService.get<string>(
      'github.oauth_client_secret',
    );
    const res = await this.httpService
      .post(
        'https://github.com/login/oauth/access_token',
        {
          code,
          client_id,
          client_secret,
          redirect_uri,
          state,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        },
      )
      .toPromise();
    return res.data;
  }

  async getGithubUserInfo(access_token: string): Promise<StringDict> {
    const res = await this.httpService
      .get('https://api.github.com/user', {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
      .toPromise();
    return res.data;
  }

  getGitlabAuthUrl(state: string): string {
    const client_id = this.configService.get<string>('gitlab.oauth_client_id');
    const redirect_uri = this.configService.get<string>(
      'gitlab.oauth_redirect_uri',
    );
    let url = new URL(`${this.gitlabHost}/oauth/authorize`);
    url.search = new URLSearchParams({
      client_id,
      redirect_uri,
      response_type: 'code',
      state,
    }).toString();
    return url.toString();
  }

  async exchangeGitlabAccessToken(
    code: string,
    state: string,
  ): Promise<StringDict> {
    const client_id = this.configService.get<string>('gitlab.oauth_client_id');
    const redirect_uri = this.configService.get<string>(
      'gitlab.oauth_redirect_uri',
    );
    const client_secret = this.configService.get<string>(
      'gitlab.oauth_client_secret',
    );
    const res = await this.httpService
      .post(
        `${this.gitlabHost}/oauth/token`,
        {
          code,
          client_id,
          client_secret,
          redirect_uri,
          state,
          grant_type: 'authorization_code',
        },
        {
          headers: {
            Accept: 'application/json',
          },
        },
      )
      .toPromise();
    return res.data;
  }

  async getGitlabUserInfo(access_token: string): Promise<StringDict> {
    const res = await this.httpService
      .get(`${this.gitlabHost}/api/v4/user`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .toPromise();
    return res.data;
  }
}
