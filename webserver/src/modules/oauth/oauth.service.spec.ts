import { Test, TestingModule } from '@nestjs/testing';
import { OauthService } from './oauth.service';
import { HttpModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

describe('OauthService', () => {
  let service: OauthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [OauthService, ConfigService],
    }).compile();

    service = module.get<OauthService>(OauthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
