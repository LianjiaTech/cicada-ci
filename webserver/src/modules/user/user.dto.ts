import { IsNumberString, IsString, IsNumber } from 'class-validator';
import { GitFrom } from '~/db/entities/user.entity';

export class IdParams {
  @IsNumberString()
  id: number;
}

export class CreateUserDto {
  readonly account: string;
  readonly name: string;
  readonly git_token: string;
  readonly from: GitFrom;
  readonly admin_level?: number;
}

export class UpdateAdminLevelDto {
  @IsNumber()
  admin_level: number;
}

export class LoginParams {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
