import { Test, TestingModule } from '@nestjs/testing';
import { DeployRecordService } from './deploy-record.service';

describe('DeployRecordService', () => {
  let service: DeployRecordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeployRecordService],
    }).compile();

    service = module.get<DeployRecordService>(DeployRecordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
