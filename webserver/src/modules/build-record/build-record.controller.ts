import {
  Controller,
  Get,
  Req,
  Query,
  Param,
  HttpException,
} from '@nestjs/common';
import { BuildRecordService } from './build-record.service';
import { PaginationOptionsInterface } from '~/common/pagination/pagination.interface';
import {
  BuildRecordListFilter,
  BuildRecordStatsDto,
  BuildRecordRangeStatsDto,
  ProjectRankingStatsDto,
} from './build-record.dto';
import { Request } from 'express';
import { BuildRecord } from '~/db/entities/build-record.entity';
import { UserService } from '../user/user.service';

@Controller('api/build-record')
export class BuildRecordController {
  constructor(
    private readonly buildRecordService: BuildRecordService,
    private readonly userService: UserService,
  ) {}

  @Get('list')
  async queryList(
    @Query() options: PaginationOptionsInterface & BuildRecordListFilter,
    @Req() req: Request,
  ) {
    return this.buildRecordService.queryList(options);
  }

  @Get('stats/summary-count')
  async queryStatsCount(
    @Query() options: BuildRecordStatsDto,
    @Req() req: Request,
  ) {
    const user = await this.userService.validateCookieUser(req);
    return this.buildRecordService.queryCountStats({
      project_id: options.project_id,
      git_from: user.from,
    });
  }

  @Get('stats/daily-count')
  async queryStatsDailyCount(
    @Query() options: BuildRecordRangeStatsDto,
    @Req() req: Request,
  ) {
    const user = await this.userService.validateCookieUser(req);
    return this.buildRecordService.queryDailyCountStats({
      ...options,
      git_from: user.from,
    });
  }

  @Get('stats/project-ranking')
  async queryStatsProjectRanking(
    @Query() options: ProjectRankingStatsDto,
    @Req() req: Request,
  ) {
    const user = await this.userService.validateCookieUser(req);
    return this.buildRecordService.queryProjectRankingStats({
      ...options,
      git_from: user.from,
    });
  }

  @Get(':id')
  async queryById(
    @Param('id') id: number,
    @Query('showLog') showLog: boolean,
  ): Promise<BuildRecord> {
    let result;
    if (showLog) {
      result = await this.buildRecordService.querySingleWithLog(id);
    } else {
      result = await this.buildRecordService.querySingleSimple(id);
    }
    if (!result || !result.id) {
      throw new HttpException({ message: 'build record not found' }, 404);
    }
    return result;
  }
}
