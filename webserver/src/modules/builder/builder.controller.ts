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
import { BuilderService } from './builder.service';
import { UserService } from '../user/user.service';
import { BuilderBody } from './builder.dto';
import { Request } from 'express';
import { Builder } from '~/db/entities/builder.entity';

@Controller('api/builder')
export class BuilderController {
  constructor(
    private readonly builderService: BuilderService,
    private readonly userService: UserService,
  ) {}

  @Post()
  async create(@Body() body: BuilderBody, @Req() req: Request) {
    const user = await this.userService.validateCookieUser(req);
    return this.builderService.create({
      ...body,
      create_user: user,
    });
  }

  @Get('list')
  async queryList(@Query('project_id') project_id: number) {
    return this.builderService.queryList(project_id);
  }

  @Get(':id')
  async queryById(@Param('id') id: number): Promise<Builder> {
    const result = await this.builderService.querySingle(id);
    if (!result || !result.id) {
      throw new HttpException({ message: 'builder not found' }, 404);
    }
    return result;
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() body: BuilderBody,
    @Req() req: Request,
  ) {
    const user = await this.userService.validateCookieUser(req);
    return this.builderService.update(id, {
      ...body,
      update_user: user,
    });
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.builderService.delete(id).catch(err => {
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new HttpException(
          { message: '有任务在使用该构建器，无法删除，请检查' },
          500,
        );
      }
      throw err;
    });
  }
}
