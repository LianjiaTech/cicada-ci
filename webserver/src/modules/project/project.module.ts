import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '~/db/entities/project.entity';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project]), UserModule],
  providers: [ProjectService],
  controllers: [ProjectController],
})
export class ProjectModule {}
