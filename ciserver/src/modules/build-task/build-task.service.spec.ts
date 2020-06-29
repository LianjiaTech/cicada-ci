import { Test, TestingModule } from '@nestjs/testing';
import { BuildTaskService } from './build-task.service';

describe('BuildTaskService', () => {
  let service: BuildTaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BuildTaskService],
    }).compile();

    service = module.get<BuildTaskService>(BuildTaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
