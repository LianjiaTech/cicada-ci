import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { BuildRecord, BuildStatus } from '~/db/entities/build-record.entity';
import { PaginationOptionsInterface } from '~/common/pagination/pagination.interface';
import {
  BuildRecordListFilter,
  BuildRecordRangeStatsDto,
  ProjectRankingStatsDto,
  BuildRecordStatsDto,
} from './build-record.dto';
import { Pagination } from '~/common/pagination/pagination.class';

@Injectable()
export class BuildRecordService {
  constructor(
    @InjectRepository(BuildRecord)
    private readonly buildRecordRepository: Repository<BuildRecord>,
  ) {}

  async queryList(options: PaginationOptionsInterface & BuildRecordListFilter) {
    const [results, total] = await this.buildRecordRepository.findAndCount({
      take: options.page_size,
      skip: options.page,
      where: {
        project_id: options.project_id,
        job_id: options.job_id,
      },
      order: { id: 'DESC' },
    });
    return new Pagination<BuildRecord>({
      results,
      total,
    });
  }

  async querySingleSimple(id: number): Promise<BuildRecord> {
    return this.buildRecordRepository.findOne({ id });
  }

  async querySingleWithLog(id: number): Promise<BuildRecord> {
    return this.buildRecordRepository
      .createQueryBuilder('record')
      .select('record')
      .addSelect('record.log')
      .where('record.id = :id', { id })
      .getOne();
  }

  async queryCountStats(options: BuildRecordStatsDto) {
    let query = this.buildRecordRepository
      .createQueryBuilder('record')
      .innerJoin('record.project', 'project')
      .select('COUNT(record.id)', 'count_total')
      .addSelect(
        `SUM(IF(record.status = '${BuildStatus.SUCCESS}', 1, 0))`,
        'count_success',
      )
      .addSelect(
        'SUM(IF(record.extra->"$.pack_from_cache" is true, 1, 0))',
        'count_cache',
      )
      .addSelect(
        `SUM(IF(record.status = '${BuildStatus.FAIL}', 1, 0))`,
        'count_fail',
      )
      .addSelect(
        `SUM(IF(record.status = '${BuildStatus.TIMEOUT}', 1, 0))`,
        'count_timeout',
      )
      .andWhere('project.git_from = :git_from', { git_from: options.git_from });
    if (options.project_id) {
      query = query
        .addSelect('record.job_id', 'job_id')
        .andWhere('record.project_id = :project_id', {
          project_id: options.project_id,
        })
        .groupBy('record.job_id')
        .orderBy('count_total', 'DESC');
    }
    return query.getRawMany();
  }

  async queryDailyCountStats(dto: BuildRecordRangeStatsDto) {
    let query = this.buildRecordRepository
      .createQueryBuilder('record')
      .innerJoin('record.project', 'project')
      .select(
        `SUM(IF(record.status = '${BuildStatus.SUCCESS}', 1, 0))`,
        'count_success',
      )
      .addSelect(
        `SUM(IF(record.status = '${BuildStatus.FAIL}', 1, 0))`,
        'count_fail',
      )
      .addSelect("DATE_FORMAT(record.create_time, '%Y-%m-%d')", 'date')
      .groupBy('date')
      .where({
        create_time: Between(dto.start_date, dto.end_date + ' 23:59:59'),
      })
      .andWhere('project.git_from = :git_from', { git_from: dto.git_from });
    if (dto.project_id) {
      query = query.andWhere('record.project_id = :project_id', {
        project_id: dto.project_id,
      });
    }
    return query.getRawMany();
  }

  async queryProjectRankingStats(dto: ProjectRankingStatsDto) {
    const LIMIT = 10;
    let query = this.buildRecordRepository
      .createQueryBuilder('record')
      .innerJoin('record.project', 'project')
      .select('record.project_id', 'project_id')
      .addSelect('project.name', 'project_name')
      .addSelect('count(record.id)', 'count')
      .groupBy('project_id')
      .orderBy('count', 'DESC')
      .limit(LIMIT)
      .where({
        create_time: Between(dto.start_date, dto.end_date + ' 23:59:59'),
      })
      .andWhere('record.status = :status', { status: dto.rank_status })
      .andWhere('project.git_from = :git_from', { git_from: dto.git_from });

    return query.getRawMany();
  }
}
