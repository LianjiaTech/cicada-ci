import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BuildRecord } from '~/db/entities/build-record.entity';
import { CreateBuildRecordDto, UpdateBuildRecordDto } from './build-record.dto';
import EventBus, { BUILD_SOCKET_EVENTS } from '~/utils/event-bus';

@Injectable()
export class BuildRecordService {
  constructor(
    @InjectRepository(BuildRecord)
    private readonly buildRecordRepository: Repository<BuildRecord>,
  ) {}

  async create(createDto: CreateBuildRecordDto) {
    const res = await this.buildRecordRepository.save(createDto);
    EventBus.emit(BUILD_SOCKET_EVENTS.STATUS, {
      id: res.id,
      job_id: res.job_id,
    });
    return res;
  }

  async update(id: number, updateDto: UpdateBuildRecordDto) {
    const record = await this.querySingle(id);
    const res = await this.buildRecordRepository.update(id, updateDto);
    if (updateDto.status) {
      EventBus.emit(BUILD_SOCKET_EVENTS.STATUS, {
        id,
        job_id: record.job_id,
      });
    } else if (updateDto.log) {
      EventBus.emit(BUILD_SOCKET_EVENTS.LOG, {
        id,
      });
    }
    return res;
  }

  async querySingle(id: number) {
    return this.buildRecordRepository.findOne(id, {
      relations: [
        'project',
        'job',
        'job.builder',
        'job.packagers',
        'job.deployers',
      ],
    });
  }
}
