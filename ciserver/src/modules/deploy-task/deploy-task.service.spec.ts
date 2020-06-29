import { Test, TestingModule } from '@nestjs/testing';
import { DeployTaskService } from './deploy-task.service';

describe('DeployTaskService', () => {
  let service: DeployTaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeployTaskService],
    }).compile();

    service = module.get<DeployTaskService>(DeployTaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
