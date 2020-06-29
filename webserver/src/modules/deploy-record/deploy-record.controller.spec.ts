import { Test, TestingModule } from '@nestjs/testing';
import { DeployRecordController } from './deploy-record.controller';
import { DeployRecordService } from './deploy-record.service';
import { DeployRecord } from '~/db/entities/deploy-record.entity';
import {
  createTestConnection,
  getRepositoryProvider,
  closeConnection,
} from '~/utils/test-utils';

describe('DeployRecord Controller', () => {
  let controller: DeployRecordController;

  beforeAll(async () => {
    await createTestConnection();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeployRecordController],
      providers: [DeployRecordService, getRepositoryProvider(DeployRecord)],
    }).compile();

    controller = module.get<DeployRecordController>(DeployRecordController);
  });

  afterAll(closeConnection);

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
