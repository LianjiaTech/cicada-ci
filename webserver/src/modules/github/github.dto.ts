import { IsString, IsBoolean } from 'class-validator';

export class GitActivityReqBody {
  @IsString()
  repo_url: string;

  @IsBoolean()
  active: boolean;
}

export class WebHook {
  id: number;
  config: { url: string };
}

export class DeployKey {
  id: number;
  key: string;
}
