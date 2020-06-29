import { Test, TestingModule } from '@nestjs/testing';
import { GithubService } from './github.service';
import { HttpModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

describe('GithubService', () => {
  let service: GithubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [GithubService, ConfigService],
    }).compile();

    service = module.get<GithubService>(GithubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
