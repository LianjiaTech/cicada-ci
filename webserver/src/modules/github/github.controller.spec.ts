import { Test, TestingModule } from '@nestjs/testing';
import { GithubController } from './github.controller';
import { HttpModule } from '@nestjs/common';
import { GithubService } from './github.service';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { User } from '~/db/entities/user.entity';
import {
  createTestConnection,
  closeConnection,
  getRepositoryProvider,
} from '~/utils/test-utils';

describe('Github Controller', () => {
  let controller: GithubController;

  beforeAll(async () => {
    await createTestConnection();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GithubController],
      imports: [HttpModule],
      providers: [
        GithubService,
        ConfigService,
        UserService,
        getRepositoryProvider(User),
      ],
    }).compile();

    controller = module.get<GithubController>(GithubController);
  });

  afterAll(closeConnection);

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
