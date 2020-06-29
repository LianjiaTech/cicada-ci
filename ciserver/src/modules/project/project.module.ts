import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '~/db/entities/project.entity';
import { ProjectService } from './project.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project])],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
