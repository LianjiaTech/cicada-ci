import { Module } from '@nestjs/common';
import { HookController } from './hook.controller';
import { ProjectModule } from '../project/project.module';
import { JobModule } from '../job/job.module';
import { BuildRecordModule } from '../build-record/build-record.module';
import { QueueModule } from '../queue/queue.module';
import { UserModule } from '../user/user.module';
import { GithubModule } from '../github/github.module';
import { GitlabModule } from '../gitlab/gitlab.module';

@Module({
  imports: [
    ProjectModule,
    JobModule,
    BuildRecordModule,
    QueueModule,
    UserModule,
    GithubModule,
    GitlabModule,
  ],
  controllers: [HookController],
})
export class HookModule {}
