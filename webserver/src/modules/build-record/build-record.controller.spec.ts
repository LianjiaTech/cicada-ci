import { Test, TestingModule } from '@nestjs/testing';
import { BuildRecordController } from './build-record.controller';
import { BuildRecordService } from './build-record.service';
import { BuildRecord } from '~/db/entities/build-record.entity';
import {
  createTestConnection,
  getRepositoryProvider,
  closeConnection,
} from '~/utils/test-utils';
import { UserService } from '../user/user.service';
import { User } from '~/db/entities/user.entity';

describe('BuildRecord Controller', () => {
  let controller: BuildRecordController;

  beforeAll(async () => {
    await createTestConnection();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuildRecordController],
      providers: [
        BuildRecordService,
        getRepositoryProvider(BuildRecord),
        UserService,
        getRepositoryProvider(User),
      ],
    }).compile();

    controller = module.get<BuildRecordController>(BuildRecordController);
  });

  afterAll(closeConnection);

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
