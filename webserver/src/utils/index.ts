import { Request } from 'express';
import * as md5 from 'md5';
import { User } from '~/db/entities/user.entity';
import { HttpException } from '@nestjs/common';

export const parseCookieUser = (req: Request) => {
  try {
    const { user } = req.cookies; // depend cookie-parser in main.ts
    return JSON.parse(user);
  } catch (e) {
    throw new HttpException({ message: 'current user parse error' }, 400);
  }
};

export const SignKeys: (
  | 'id'
  | 'account'
  | 'name'
  | 'from'
  | 'git_token'
  | 'create_time'
)[] = ['id', 'account', 'name', 'from', 'git_token', 'create_time'];

export const getSign = (user: User) => {
  const pairs = SignKeys.sort()
    .map(key => `${key}=${user[key]}`)
    .join('');
  return md5(pairs);
};
