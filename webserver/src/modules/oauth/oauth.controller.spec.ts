import { Test, TestingModule } from '@nestjs/testing';
import { OauthController } from './oauth.controller';
import { HttpModule } from '@nestjs/common';
import { OauthService } from './oauth.service';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '~/db/entities/user.entity';
import { WinstonModule } from 'nest-winston';
import {
  createTestConnection,
  getRepositoryProvider,
  closeConnection,
} from '~/utils/test-utils';

describe('Oauth Controller', () => {
  let controller: OauthController;

  beforeAll(async () => {
    await createTestConnection();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OauthController],
      imports: [
        HttpModule,
        WinstonModule.forRootAsync({
          useFactory: () => ({}),
          inject: [],
        }),
      ],
      providers: [
        OauthService,
        ConfigService,
        UserService,
        getRepositoryProvider(User),
      ],
    }).compile();

    controller = module.get<OauthController>(OauthController);
  });

  afterAll(closeConnection);

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
