import { Test, TestingModule } from '@nestjs/testing';
import { BuildRecordService } from './build-record.service';
import { BuildRecord } from '~/db/entities/build-record.entity';
import {
  createTestConnection,
  getRepositoryProvider,
  closeConnection,
} from '~/utils/test-utils';

describe('BuildRecordService', () => {
  let service: BuildRecordService;

  beforeAll(async () => {
    await createTestConnection();
    const module: TestingModule = await Test.createTestingModule({
      providers: [BuildRecordService, getRepositoryProvider(BuildRecord)],
    }).compile();

    service = module.get<BuildRecordService>(BuildRecordService);
  });

  afterAll(closeConnection);

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
