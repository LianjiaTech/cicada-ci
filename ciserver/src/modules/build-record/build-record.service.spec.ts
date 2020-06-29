import { Test, TestingModule } from '@nestjs/testing';
import { BuildRecordService } from './build-record.service';

describe('BuildRecordService', () => {
  let service: BuildRecordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BuildRecordService],
    }).compile();

    service = module.get<BuildRecordService>(BuildRecordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
