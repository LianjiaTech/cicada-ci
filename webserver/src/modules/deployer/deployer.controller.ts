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
import { DeployerService } from './deployer.service';
import { UserService } from '../user/user.service';
import { DeployerBody } from './deployer.dto';
import { Request } from 'express';
import { Deployer } from '~/db/entities/deployer.entity';

@Controller('api/deployer')
export class DeployerController {
  constructor(
    private readonly deployerService: DeployerService,
    private readonly userService: UserService,
  ) {}

  @Post()
  async create(@Body() body: DeployerBody, @Req() req: Request) {
    const user = await this.userService.validateCookieUser(req);
    return this.deployerService.create({
      ...body,
      create_user: user,
    });
  }

  @Get('list')
  async queryList(@Query('project_id') project_id: number) {
    return this.deployerService.queryList(project_id);
  }

  @Get(':id')
  async queryById(@Param('id') id: number): Promise<Deployer> {
    const result = await this.deployerService.querySingle(id);
    if (!result || !result.id) {
      throw new HttpException({ message: 'deployer not found' }, 404);
    }
    return result;
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() body: DeployerBody,
    @Req() req: Request,
  ) {
    const user = await this.userService.validateCookieUser(req);
    return this.deployerService.update(id, {
      ...body,
      update_user: user,
    });
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.deployerService.delete(id).catch(err => {
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new HttpException(
          { message: '有任务在使用该发布器，无法删除，请检查' },
          500,
        );
      }
      throw err;
    });
  }
}
