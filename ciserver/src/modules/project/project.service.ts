import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '~/db/entities/project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async getProjectByRepoUrl(repo_url = '') {
    return await this.projectRepository.findOne({ repo_url });
  }

  async getProjectByGitId(repo_id = 0) {
    return await this.projectRepository.findOne({ repo_id });
  }
}
