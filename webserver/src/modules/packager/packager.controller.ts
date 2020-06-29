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
import { PackagerService } from './packager.service';
import { UserService } from '../user/user.service';
import { PackagerBody } from './packager.dto';
import { Request } from 'express';
import { Packager } from '~/db/entities/packager.entity';

@Controller('api/packager')
export class PackagerController {
  constructor(
    private readonly packagerService: PackagerService,
    private readonly userService: UserService,
  ) {}

  @Post()
  async create(@Body() body: PackagerBody, @Req() req: Request) {
    const user = await this.userService.validateCookieUser(req);
    return this.packagerService.create({
      ...body,
      create_user: user,
    });
  }

  @Get('list')
  async queryList(@Query('project_id') project_id: number) {
    return this.packagerService.queryList(project_id);
  }

  @Get(':id')
  async queryById(@Param('id') id: number): Promise<Packager> {
    const result = await this.packagerService.querySingle(id);
    if (!result || !result.id) {
      throw new HttpException({ message: 'packager not found' }, 404);
    }
    return result;
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() body: PackagerBody,
    @Req() req: Request,
  ) {
    const user = await this.userService.validateCookieUser(req);
    return this.packagerService.update(id, {
      ...body,
      update_user: user,
    });
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.packagerService.delete(id).catch(err => {
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new HttpException(
          { message: '有任务在使用该打包器，无法删除，请检查' },
          500,
        );
      }
      throw err;
    });
  }
}
