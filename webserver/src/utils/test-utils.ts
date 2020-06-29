import {
  createConnection,
  Connection,
  getRepository,
  getConnection,
} from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Provider } from '@nestjs/common';
import { CreateUserDto } from '~/modules/user/user.dto';
import { join } from 'path';
import { Request } from 'express';
import { User } from '~/db/entities/user.entity';
import { getSign } from '.';
import { CreateProjectDto } from '~/modules/project/project.dto';

export const createTestConnection = (): Promise<Connection> => {
  return createConnection({
    type: 'mysql',
    charset: 'UTF8MB4_GENERAL_CI',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '123456',
    database: 'test_feci_open',
    entities: [join(__dirname, '../db/entities/*.entity{.ts,.js}')],
    dropSchema: true,
    synchronize: true,
    logging: false,
  });
};

export const getRepositoryProvider = (entity): Provider => {
  const repository = getRepository(entity);
  return {
    provide: getRepositoryToken(entity),
    useValue: repository,
  };
};

export const closeConnection = async () => {
  const connection = getConnection();
  return await connection.close();
};

export const USER_TEST: CreateUserDto = {
  account: 'foo',
  name: 'bar',
  git_token: 'c',
  from: 'github',
};

export const PROJECT_TEST: CreateProjectDto = {
  name: 'foo',
  git_from: 'github',
  repo_url: 'a',
  ssh_url: 'b',
  clone_with_ssh: false,
  repo_id: 1,
  enable_webhook: false,
  create_user: null,
  group: null,
  admins: [],
  adv_configs: { enable_deps_cache: false, install_type: 0 },
};

export const getTestUserRequest = (user: User) =>
  ({
    cookies: {
      user: JSON.stringify({
        id: 1,
        sign: getSign(user),
        ...USER_TEST,
      }),
    },
  } as Request);
