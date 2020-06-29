import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  Post,
  Body,
  Put,
  Delete,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { User } from '~/db/entities/user.entity';
import { IdParams, UpdateAdminLevelDto } from './user.dto';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //Login Auth-------------------------------
  //开源系统中只实现oauth, login不作实现，由使用方自行对接各自用户系统；

  @Post('logout')
  logout(@Res() res: Response) {
    res.cookie('user', '', { expires: new Date('1970-01-01') });
    res.json({
      code: 0,
      data: {},
      message: '',
    });
  }

  //User Admin----------------------------------
  @Get('admins')
  queryAdminList(): Promise<User[]> {
    return this.userService.queryAdminList();
  }

  //Base--------------------------------
  @Get('search')
  async search(@Query('keyword') keyword: string): Promise<User[]> {
    return this.userService.search(keyword);
  }

  @Get()
  async queryList(): Promise<User[]> {
    return this.userService.queryList();
  }

  @Put(':id')
  async updateAdminLevel(
    @Param() params: IdParams,
    @Body() updateUserDto: UpdateAdminLevelDto,
  ) {
    await this.userService.updateAdminLevel(params.id, updateUserDto);
    return 'ok';
  }

  @Get(':id')
  async queryById(@Param() params: IdParams): Promise<User> {
    const record = await this.userService.queryById(params.id);
    if (!record) {
      throw new NotFoundException();
    }
    return record;
  }

  @Delete(':id')
  async delete(@Param() params: IdParams) {
    return await this.userService.delete(params.id);
  }
}
