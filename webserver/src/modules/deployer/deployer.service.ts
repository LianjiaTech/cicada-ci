import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deployer } from '~/db/entities/deployer.entity';
import { CreateDeployerDto, UpdateDeployerDto } from './deployer.dto';

@Injectable()
export class DeployerService {
  constructor(
    @InjectRepository(Deployer)
    private readonly deployerRepository: Repository<Deployer>,
  ) {}

  async create(createDto: CreateDeployerDto): Promise<Deployer> {
    const result = await this.deployerRepository.save(createDto);
    return result;
  }

  async queryList(project_id: number): Promise<Deployer[]> {
    const maxium = 100;
    return await this.deployerRepository.find({
      order: { id: 'ASC' },
      where: { project_id },
      take: maxium,
      relations: ['create_user', 'update_user'],
    });
  }

  async querySingle(id: number): Promise<Deployer> {
    return this.deployerRepository.findOne(id, {
      relations: ['create_user', 'update_user'],
    });
  }

  async update(id: number, UpdateDto: UpdateDeployerDto) {
    const result = await this.deployerRepository.update(id, UpdateDto);
    return result;
  }

  async delete(id: number) {
    //todo check no job related to the builder
    //todo use soft delete after typeorm support on 0.3.0
    return this.deployerRepository.delete(id);
  }
}
