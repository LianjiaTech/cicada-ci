import { IsNumberString, IsNotEmpty } from 'class-validator';

export class DownloadParamsDto {
  @IsNumberString()
  readonly id: number;

  @IsNotEmpty()
  readonly package_name: string;
}
