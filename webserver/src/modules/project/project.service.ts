import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import {
  CreateProjectDto,
  ProjectListFilter,
  UpdateProjectDto,
} from './project.dto';
import { Project } from '~/db/entities/project.entity';
import { PaginationOptionsInterface } from '~/common/pagination/pagination.interface';
import { Pagination } from '~/common/pagination/pagination.class';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(createDto: CreateProjectDto): Promise<Project> {
    const result = await this.projectRepository.save(createDto);
    return result;
  }

  async update(id: number, updateDto: UpdateProjectDto) {
    //@ManyToMany not support update directly
    const project = await this.projectRepository.findOne(id);
    Object.keys(updateDto).map(key => {
      project[key] = updateDto[key];
    });
    const result = await this.projectRepository.save(project);
    return result;
  }

  async queryList(
    options: PaginationOptionsInterface & ProjectListFilter,
    uid: number,
  ): Promise<Pagination<Project>> {
    let where: any = {
      name: Like(`%${options.keywords}%`),
      git_from: options.git_from,
    };
    if (options.created) {
      where.create_uid = uid;
    }
    const [results, total] = await this.projectRepository.findAndCount({
      take: options.page_size,
      skip: options.page,
      where,
      relations: ['create_user', 'admins', 'group'],
      order: { id: 'DESC' },
    });
    return new Pagination<Project>({
      results,
      total,
    });
  }

  async querySingle(id: number): Promise<Project> {
    return this.projectRepository.findOne(id, {
      relations: ['create_user', 'admins', 'group'],
    });
  }

  async delete(id: number) {
    //todo use soft delete after typeorm support on 0.3.0
    return this.projectRepository.delete(id);
  }
}
