import * as path from 'path';
import * as fs from 'fs';
import { Controller, Get, Param, HttpException, Res } from '@nestjs/common';
import { DownloadParamsDto } from './download.dto';
import { BuildRecordService } from '../build-record/build-record.service';
import globalTaskConfig from '~/configs/build-task';
import { Response } from 'express';

@Controller('download')
export class DownloadController {
  constructor(private readonly buildRecordService: BuildRecordService) {}

  @Get(':id/:package_name')
  async download(
    @Param() { id, package_name }: DownloadParamsDto,
    @Res() res: Response,
  ) {
    const record = await this.buildRecordService.querySingle(id);
    if (!record) {
      throw new HttpException({ message: 'record not found' }, 404);
    }

    const pack = record.package_sizes.find(
      item => item.package_name === package_name,
    );
    if (!pack) {
      throw new HttpException(
        { message: 'package_name not found in record' },
        404,
      );
    }

    const packagePath = path.join(
      globalTaskConfig.packspace,
      `${record.project_id}/${id}/${package_name}`,
    );

    if (!fs.existsSync(packagePath)) {
      throw new HttpException({ message: 'package not found' }, 404);
    }

    res.set({
      'Content-Type': 'application/gzip',
      'Content-Length': pack.size,
    });

    return res.download(packagePath);
  }
}
