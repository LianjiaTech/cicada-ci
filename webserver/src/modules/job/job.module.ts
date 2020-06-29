import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from '~/db/entities/job.entity';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Job]), UserModule],
  providers: [JobService],
  controllers: [JobController],
})
export class JobModule {}
