import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from '~/db/entities/job.entity';
import { Repository } from 'typeorm';
import { CreateJobDto, JobListFilter, UpdateJobDto } from './job.dto';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  async create(createDto: CreateJobDto): Promise<Job> {
    const result = await this.jobRepository.save(createDto);
    return result;
  }

  async queryList(options: JobListFilter): Promise<Job[]> {
    const maxium = 100;
    return await this.jobRepository.find({
      order: { id: 'ASC' },
      where: { project_id: options.project_id },
      take: maxium,
      relations: [
        'create_user',
        'update_user',
        'builder',
        'packagers',
        'deployers',
      ],
    });
  }

  async querySingle(id: number): Promise<Job> {
    return this.jobRepository.findOne(id, {
      relations: [
        'create_user',
        'update_user',
        'builder',
        'packagers',
        'deployers',
      ],
    });
  }

  async update(id: number, updateDto: UpdateJobDto) {
    const job = await this.jobRepository.findOne(id);
    Object.keys(updateDto).map(key => {
      job[key] = updateDto[key];
    });
    const result = await this.jobRepository.save(job);
    return result;
  }

  async delete(id: number) {
    //todo check no job related to the builder
    //todo use soft delete after typeorm support on 0.3.0
    return this.jobRepository.delete(id);
  }
}
