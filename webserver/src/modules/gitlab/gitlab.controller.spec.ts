import { Test, TestingModule } from '@nestjs/testing';
import { GitlabController } from './gitlab.controller';
import { HttpModule } from '@nestjs/common';
import { GitlabService } from './gitlab.service';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { User } from '~/db/entities/user.entity';
import {
  createTestConnection,
  getRepositoryProvider,
  closeConnection,
} from '~/utils/test-utils';

describe('Gitlab Controller', () => {
  let controller: GitlabController;

  beforeAll(async () => {
    await createTestConnection();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GitlabController],
      imports: [HttpModule],
      providers: [
        GitlabService,
        ConfigService,
        UserService,
        getRepositoryProvider(User),
      ],
    }).compile();

    controller = module.get<GitlabController>(GitlabController);
  });

  afterAll(closeConnection);

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
