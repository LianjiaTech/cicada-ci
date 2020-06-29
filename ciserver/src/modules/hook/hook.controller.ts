import { Controller, Post, Body, HttpException, Req } from '@nestjs/common';
import { ProjectService } from '../project/project.service';
import { JobService } from '../job/job.service';
import { BuildRecordService } from '../build-record/build-record.service';
import { BuildStatus } from '~/db/entities/build-record.entity';
import {
  GithubWebhookDto,
  ManualCreateDto,
  GitlabWebhookDto,
} from './hook.dto';
import { QueueService } from '../queue/queue.service';
import { Request } from 'express';
import { UserService } from '../user/user.service';
import { GithubService } from '../github/github.service';
import { GitlabService } from '../gitlab/gitlab.service';

@Controller('hook')
export class HookController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly jobService: JobService,
    private readonly buildRecordService: BuildRecordService,
    private readonly queueService: QueueService,
    private readonly userService: UserService,
    private readonly githubService: GithubService,
    private readonly gitlabService: GitlabService,
  ) {}

  @Post('github')
  async githubWebHook(@Body() body: GithubWebhookDto) {
    const { ref, repository, commits } = body;
    const project = await this.projectService.getProjectByRepoUrl(
      repository.html_url,
    );

    if (!project) {
      throw new HttpException({ message: 'project not found' }, 404);
    }

    let branch;

    if (ref.indexOf('refs/tags') > -1) {
      branch = ref.split('refs/')[1];
    } else {
      branch = ref.split('refs/heads/')[1];
    }

    const jobs = await this.jobService.getJobsMatchBranch(project.id, branch);

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      const buildRecord = await this.buildRecordService.create({
        project,
        job,
        branch,
        commits,
        status: BuildStatus.INIT,
        source: 'webhook',
      });
      if (job.auto_build) {
        this.queueService.add(buildRecord.id);
      }
    }

    return 'ok';
  }

  @Post('gitlab')
  async gitlabWebHook(@Body() body: GitlabWebhookDto) {
    const { ref, project_id, commits } = body;
    const project = await this.projectService.getProjectByGitId(project_id);

    if (!project) {
      throw new HttpException({ message: 'project not found' }, 404);
    }

    let branch;

    if (ref.indexOf('refs/tags') > -1) {
      branch = ref.split('refs/')[1];
    } else {
      branch = ref.split('refs/heads/')[1];
    }

    const jobs = await this.jobService.getJobsMatchBranch(project.id, branch);

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      const buildRecord = await this.buildRecordService.create({
        project,
        job,
        branch,
        commits,
        status: BuildStatus.INIT,
        source: 'webhook',
      });
      if (job.auto_build) {
        this.queueService.add(buildRecord.id);
      }
    }

    return 'ok';
  }

  @Post('manualCreate')
  async buildCreate(
    @Body() { job_id, branch, from }: ManualCreateDto,
    @Req() req: Request,
  ) {
    const { git_token } = await this.userService.validateCookieUser(req);
    const job = await this.jobService.querySingle(job_id);
    const project = job.project;
    let commit;
    switch (from) {
      case 'github':
        commit = await this.githubService.getCommitFromBranch(
          git_token,
          project.repo_url,
          branch,
        );
        break;
      case 'gitlab':
        commit = await this.gitlabService.getCommitFromBranch(
          git_token,
          project.repo_url,
          branch,
        );
        break;
      default:
        throw new HttpException({ message: 'unknown git source' }, 400);
    }

    const buildRecord = await this.buildRecordService.create({
      project: job.project,
      job,
      branch,
      commits: [commit],
      status: BuildStatus.INIT,
      source: 'devtool',
    });
    if (job.auto_build) {
      this.queueService.add(buildRecord.id);
    }
    return 'ok';
  }
}
