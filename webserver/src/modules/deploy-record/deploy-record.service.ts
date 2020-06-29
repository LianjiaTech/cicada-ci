import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeployRecord } from '~/db/entities/deploy-record.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DeployRecordService {
  constructor(
    @InjectRepository(DeployRecord)
    private readonly deployRecordRepository: Repository<DeployRecord>,
  ) {}

  async queryList(build_id: number) {
    const maxium = 100;
    return await this.deployRecordRepository.find({
      order: { id: 'DESC' },
      where: { build_id },
      take: maxium,
      relations: ['create_user', 'deployer'],
    });
  }

  async querySingleSimple(id: number): Promise<DeployRecord> {
    return this.deployRecordRepository.findOne({ id });
  }

  async querySingleWithLog(id: number): Promise<DeployRecord> {
    return this.deployRecordRepository
      .createQueryBuilder('record')
      .select('record')
      .addSelect('record.log')
      .where('record.id = :id', { id })
      .getOne();
  }
}
