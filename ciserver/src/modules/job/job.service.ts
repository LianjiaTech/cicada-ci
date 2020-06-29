import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '~/db/entities/job.entity';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  async getJobsMatchBranch(project_id = 0, branch = '') {
    const maxium = 100;
    const jobs = await this.jobRepository.find({
      order: { id: 'ASC' },
      where: { project_id: project_id },
      take: maxium,
      relations: ['builder', 'packagers', 'deployers'],
    });
    return jobs.filter(job => job.branches.indexOf(branch) > -1);
  }

  async querySingle(id: number) {
    return await this.jobRepository.findOne(id, {
      relations: ['project'],
    });
  }
}
