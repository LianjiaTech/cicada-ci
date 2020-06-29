import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from '~/db/entities/job.entity';
import { JobService } from './job.service';

@Module({
  imports: [TypeOrmModule.forFeature([Job])],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {}
