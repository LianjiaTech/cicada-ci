import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from '~/db/entities/group.entity';
import { Repository } from 'typeorm';
import { CreateGroupDto, UpdateGroupDto } from './group.dto';
import { PaginationOptionsInterface } from '~/common/pagination/pagination.interface';
import { Pagination } from '~/common/pagination/pagination.class';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  async create(createDto: CreateGroupDto): Promise<Group> {
    const result = await this.groupRepository.save(createDto);
    return result;
  }

  async queryList(
    options: PaginationOptionsInterface,
  ): Promise<Pagination<Group>> {
    const [results, total] = await this.groupRepository.findAndCount({
      take: options.page_size,
      skip: options.page,
      relations: ['admins', 'projects', 'create_user', 'update_user'],
      order: { id: 'DESC' },
    });
    return new Pagination<Group>({
      results,
      total,
    });
  }

  async queryListAll(): Promise<Group[]> {
    const maxium = 100;
    return await this.groupRepository.find({
      order: { id: 'ASC' },
      select: ['id', 'name'],
      take: maxium,
    });
  }

  async querySingle(id: number): Promise<Group> {
    return this.groupRepository.findOne(id, {
      relations: ['create_user', 'admins'],
    });
  }

  async update(id: number, updateDto: UpdateGroupDto) {
    //@ManyToMany not support update directly
    const group = await this.groupRepository.findOne(id);
    Object.keys(updateDto).map(key => {
      group[key] = updateDto[key];
    });
    const result = await this.groupRepository.save(group);
    return result;
  }

  async delete(id: number) {
    //todo use soft delete after typeorm support on 0.3.0
    return this.groupRepository.delete(id);
  }
}
