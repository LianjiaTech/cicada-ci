import { Controller, Get, Query, Param, HttpException } from '@nestjs/common';
import { DeployRecordService } from './deploy-record.service';
import { DeployRecord } from '~/db/entities/deploy-record.entity';

@Controller('api/deploy-record')
export class DeployRecordController {
  constructor(private readonly deployRecordService: DeployRecordService) {}

  @Get('list')
  async queryList(@Query('build_id') build_id: number) {
    return this.deployRecordService.queryList(build_id);
  }

  @Get(':id')
  async queryById(
    @Param('id') id: number,
    @Query('showLog') showLog: boolean,
  ): Promise<DeployRecord> {
    let result;
    if (showLog) {
      result = await this.deployRecordService.querySingleWithLog(id);
    } else {
      result = await this.deployRecordService.querySingleSimple(id);
    }
    if (!result || !result.id) {
      throw new HttpException({ message: 'build record not found' }, 404);
    }
    return result;
  }
}
