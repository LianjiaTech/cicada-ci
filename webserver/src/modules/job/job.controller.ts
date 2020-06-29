import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  Query,
  Param,
  HttpException,
  Put,
  Delete,
} from '@nestjs/common';
import { JobService } from './job.service';
import { UserService } from '../user/user.service';
import { Request } from 'express';
import { Job } from '~/db/entities/job.entity';
import { JobBody, JobListFilter } from './job.dto';

@Controller('api/job')
export class JobController {
  constructor(
    private readonly jobService: JobService,
    private readonly userService: UserService,
  ) {}

  @Post()
  async create(@Body() body: JobBody, @Req() req: Request) {
    const user = await this.userService.validateCookieUser(req);
    return this.jobService.create({
      ...body,
      create_user: user,
    });
  }

  @Get('list')
  async queryList(@Query() options: JobListFilter) {
    return this.jobService.queryList({
      ...options,
    });
  }

  @Get(':id')
  async queryById(@Param('id') id: number): Promise<Job> {
    const result = await this.jobService.querySingle(id);
    if (!result || !result.id) {
      throw new HttpException({ message: 'job not found' }, 404);
    }
    return result;
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() body: JobBody,
    @Req() req: Request,
  ) {
    const user = await this.userService.validateCookieUser(req);
    return this.jobService.update(id, {
      ...body,
      update_user: user,
    });
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.jobService.delete(id);
  }
}
