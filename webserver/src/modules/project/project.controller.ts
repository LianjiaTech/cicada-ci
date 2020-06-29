import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Req,
  HttpException,
  Query,
  Param,
} from '@nestjs/common';
import { Request } from 'express';
import { ProjectService } from './project.service';
import {
  CreateProjectBody,
  ProjectListFilter,
  UpdateProjectBody,
} from './project.dto';
import { UserService } from '../user/user.service';
import { PaginationOptionsInterface } from '~/common/pagination/pagination.interface';
import { Project } from '~/db/entities/project.entity';

const handleDupEntryError = err => {
  if (err.code === 'ER_DUP_ENTRY') {
    throw new HttpException({ message: '项目仓库地址重复，请确认' }, 500);
  }
  throw err;
};

@Controller('api/project')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly userService: UserService,
  ) {}

  @Post()
  async create(@Body() body: CreateProjectBody, @Req() req: Request) {
    const user = await this.userService.validateCookieUser(req);
    return this.projectService
      .create({
        ...body,
        git_from: user.from,
        create_user: user,
      })
      .catch(handleDupEntryError);
  }

  @Get('list')
  async queryList(
    @Query() options: PaginationOptionsInterface & ProjectListFilter,
    @Req() req: Request,
  ) {
    const user = await this.userService.validateCookieUser(req);
    return this.projectService.queryList(
      {
        ...options,
        git_from: user.from,
        created: options.created === 'true',
      },
      user.id,
    );
  }

  @Get(':id')
  async queryById(@Param('id') id: number): Promise<Project> {
    const result = await this.projectService.querySingle(id);
    if (!result || !result.id) {
      throw new HttpException({ message: 'project not found' }, 404);
    }
    return result;
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() body: UpdateProjectBody,
    @Req() req: Request,
  ) {
    const user = await this.userService.validateCookieUser(req);
    return this.projectService
      .update(id, {
        ...body,
        update_user: user,
      })
      .catch(handleDupEntryError);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.projectService.delete(id);
  }
}
