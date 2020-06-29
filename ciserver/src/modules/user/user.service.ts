import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '~/db/entities/user.entity';
import { Repository } from 'typeorm';
import { parseCookieUser, getSign, SignKeys } from '~/utils/user';
import { Request } from 'express';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async validateCookieUser(req: Request): Promise<User> {
    const { id, sign } = parseCookieUser(req);
    const user = await this.queryByIdWithToken(id);
    if (sign === getSign(user)) {
      return user;
    } else {
      throw new HttpException({ message: 'user validate failed' }, 401);
    }
  }

  private async queryByIdWithToken(id = 0): Promise<User> {
    return await this.userRepository.findOne(id, {
      select: SignKeys,
    });
  }
}
