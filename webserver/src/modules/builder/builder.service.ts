import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Builder } from '~/db/entities/builder.entity';
import { CreateBuilderDto, UpdateBuilderDto } from './builder.dto';

@Injectable()
export class BuilderService {
  constructor(
    @InjectRepository(Builder)
    private readonly builderRepository: Repository<Builder>,
  ) {}

  async create(createDto: CreateBuilderDto): Promise<Builder> {
    const result = await this.builderRepository.save(createDto);
    return result;
  }

  async queryList(project_id: number): Promise<Builder[]> {
    const maxium = 100;
    return await this.builderRepository.find({
      order: { id: 'ASC' },
      where: { project_id },
      take: maxium,
      relations: ['create_user', 'update_user'],
    });
  }

  async querySingle(id: number): Promise<Builder> {
    return this.builderRepository.findOne(id, {
      relations: ['create_user', 'update_user'],
    });
  }

  async update(id: number, UpdateDto: UpdateBuilderDto) {
    const result = await this.builderRepository.update(id, UpdateDto);
    return result;
  }

  async delete(id: number) {
    //todo check no job related to the builder
    //todo use soft delete after typeorm support on 0.3.0
    return this.builderRepository.delete(id);
  }
}
