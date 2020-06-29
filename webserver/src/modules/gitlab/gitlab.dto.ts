import { IsString, IsBoolean } from 'class-validator';

export class GitActivityReqBody {
  @IsString()
  repo_url: string;

  @IsBoolean()
  active: boolean;
}

export class WebHook {
  id: number;
  url: string;
}

export class DeployKey {
  id: number;
  key: string;
}
