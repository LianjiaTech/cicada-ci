import { Test, TestingModule } from '@nestjs/testing';
import { DeployRecordService } from './deploy-record.service';
import { DeployRecord } from '~/db/entities/deploy-record.entity';
import {
  createTestConnection,
  getRepositoryProvider,
  closeConnection,
} from '~/utils/test-utils';

describe('DeployRecordService', () => {
  let service: DeployRecordService;

  beforeAll(async () => {
    await createTestConnection();
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeployRecordService, getRepositoryProvider(DeployRecord)],
    }).compile();

    service = module.get<DeployRecordService>(DeployRecordService);
  });

  afterAll(closeConnection);

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
