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
import { GroupService } from './group.service';
import { UserService } from '../user/user.service';
import { GroupBody } from './group.dto';
import { Request } from 'express';
import { PaginationOptionsInterface } from '~/common/pagination/pagination.interface';
import { Group } from '~/db/entities/group.entity';

const handleDupEntryError = err => {
  if (err.code === 'ER_DUP_ENTRY') {
    throw new HttpException({ message: '分组名称重复，请确认' }, 500);
  }
  throw err;
};

@Controller('api/group')
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly userService: UserService,
  ) {}

  @Post()
  async create(@Body() body: GroupBody, @Req() req: Request) {
    const user = await this.userService.validateCookieUser(req);
    return this.groupService
      .create({
        ...body,
        create_user: user,
      })
      .catch(handleDupEntryError);
  }

  @Get('list')
  async queryList(@Query() options: PaginationOptionsInterface) {
    return this.groupService.queryList(options);
  }

  @Get('all')
  async queryListAll() {
    return this.groupService.queryListAll();
  }

  @Get(':id')
  async queryById(@Param('id') id: number): Promise<Group> {
    const result = await this.groupService.querySingle(id);
    if (!result || !result.id) {
      throw new HttpException({ message: 'group not found' }, 404);
    }
    return result;
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() body: GroupBody,
    @Req() req: Request,
  ) {
    const user = await this.userService.validateCookieUser(req);
    const admin_ids = body.admins.map(user => user.id);
    const admins = await this.userService.queryByIds(admin_ids);
    return this.groupService
      .update(id, {
        ...body,
        admins,
        update_user: user,
      })
      .catch(handleDupEntryError);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.groupService.delete(id).catch(err => {
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new HttpException(
          { message: '该分组非空，无法删除，请检查' },
          500,
        );
      }
      throw err;
    });
  }
}
