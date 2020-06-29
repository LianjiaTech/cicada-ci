import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Packager } from '~/db/entities/packager.entity';
import { CreatePackagerDto, UpdatePackagerDto } from './packager.dto';

@Injectable()
export class PackagerService {
  constructor(
    @InjectRepository(Packager)
    private readonly packagerRepository: Repository<Packager>,
  ) {}

  async create(createDto: CreatePackagerDto): Promise<Packager> {
    const result = await this.packagerRepository.save(createDto);
    return result;
  }

  async queryList(project_id: number): Promise<Packager[]> {
    const maxium = 100;
    return await this.packagerRepository.find({
      order: { id: 'ASC' },
      where: { project_id },
      take: maxium,
      relations: ['create_user', 'update_user'],
    });
  }

  async querySingle(id: number): Promise<Packager> {
    return this.packagerRepository.findOne(id, {
      relations: ['create_user', 'update_user'],
    });
  }

  async update(id: number, UpdateDto: UpdatePackagerDto) {
    const result = await this.packagerRepository.update(id, UpdateDto);
    return result;
  }

  async delete(id: number) {
    //todo check no job related to the builder
    //todo use soft delete after typeorm support on 0.3.0
    return this.packagerRepository.delete(id);
  }
}
