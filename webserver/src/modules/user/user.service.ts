import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult, MoreThanOrEqual, Like } from 'typeorm';
import { User } from '~/db/entities/user.entity';
import { CreateUserDto, UpdateAdminLevelDto } from './user.dto';
import { Request } from 'express';
import { parseCookieUser, getSign, SignKeys } from '~/utils';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  //test login is only for dev, unit-test and debug, which includes no validation
  async testLogin(createUserDto: CreateUserDto): Promise<User> {
    let user = await this.userRepository.findOne({
      account: createUserDto.account,
    });
    if (user && user.id) {
      user.git_token = createUserDto.git_token;
    }
    return await this.userRepository.save(user || createUserDto);
  }

  async validateCookieUser(req: Request): Promise<User> {
    const { id, sign } = parseCookieUser(req);
    const user = await this.queryByIdWithToken(id);
    if (sign === getSign(user)) {
      return user;
    } else {
      throw new HttpException({ message: 'user validate failed' }, 401);
    }
  }

  async queryList(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async queryById(id = 0): Promise<User> {
    return await this.userRepository.findOne({ id });
  }

  async queryByIds(ids = []): Promise<User[]> {
    return await this.userRepository.findByIds(ids);
  }

  private async queryByIdWithToken(id = 0): Promise<User> {
    return await this.userRepository.findOne(id, {
      select: SignKeys,
    });
  }

  async delete(id = 0) {
    return this.userRepository.delete(id);
  }

  async queryAdminList(): Promise<User[]> {
    return await this.userRepository.find({ admin_level: MoreThanOrEqual(1) });
  }

  async updateAdminLevel(
    id = 0,
    updateDto: UpdateAdminLevelDto,
  ): Promise<UpdateResult> {
    return this.userRepository.update(id, updateDto);
  }

  async search(keyword: string): Promise<User[]> {
    return await this.userRepository.find({
      where: [
        {
          account: Like(`%${keyword}%`),
        },
        {
          name: Like(`%${keyword}%`),
        },
      ],
    });
  }
}
