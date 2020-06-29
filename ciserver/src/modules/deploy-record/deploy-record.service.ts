import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeployRecord } from '~/db/entities/deploy-record.entity';
import { Repository } from 'typeorm';
import {
  CreateDeployRecordDto,
  UpdateDeployRecordDto,
} from './deploy-record.dto';
import EventBus, { DEPLOY_SOCKET_EVENTS } from '~/utils/event-bus';

@Injectable()
export class DeployRecordService {
  constructor(
    @InjectRepository(DeployRecord)
    private readonly deployRecordRepository: Repository<DeployRecord>,
  ) {}

  async create(createDto: CreateDeployRecordDto) {
    const res = await this.deployRecordRepository.save(createDto);
    EventBus.emit(DEPLOY_SOCKET_EVENTS.STATUS, {
      id: res.id,
      build_id: res.build_id,
    });
    return res;
  }

  async update(id: number, updateDto: UpdateDeployRecordDto) {
    const record = await this.querySingle(id);

    const res = await this.deployRecordRepository.update(id, updateDto);
    if (updateDto.status) {
      EventBus.emit(DEPLOY_SOCKET_EVENTS.STATUS, {
        id,
        build_id: record.build_id,
      });
    } else if (updateDto.log) {
      EventBus.emit(DEPLOY_SOCKET_EVENTS.LOG, {
        id,
        build_id: record.build_id,
      });
    }
    return res;
  }

  async querySingle(id: number) {
    return this.deployRecordRepository.findOne(id, {
      relations: ['buildRecord', 'deployer'],
    });
  }
}
