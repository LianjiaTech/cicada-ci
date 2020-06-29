import { Test, TestingModule } from '@nestjs/testing';
import { GitlabService } from './gitlab.service';
import { HttpModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

describe('GitlabService', () => {
  let service: GitlabService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [GitlabService, ConfigService],
    }).compile();

    service = module.get<GitlabService>(GitlabService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
