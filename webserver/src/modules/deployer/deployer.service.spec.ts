import { Test, TestingModule } from '@nestjs/testing';
import { DeployerService } from './deployer.service';
import { Deployer } from '~/db/entities/deployer.entity';
import {
  createTestConnection,
  getRepositoryProvider,
  closeConnection,
} from '~/utils/test-utils';

describe('DeployerService', () => {
  let service: DeployerService;

  beforeAll(async () => {
    await createTestConnection();
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeployerService, getRepositoryProvider(Deployer)],
    }).compile();

    service = module.get<DeployerService>(DeployerService);
  });

  afterAll(closeConnection);

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create', async done => {
    const res = await service.create({
      project_id: 1,
      name: 'foo',
      scripts: 'bar',
      branch_filter: '',
      create_user: null,
    });
    expect(res.id).toEqual(1);
    done();
  });

  it('query list', async done => {
    const res = await service.queryList(1);
    expect(res.length).toEqual(1);
    done();
  });

  it('query single', async done => {
    const res = await service.querySingle(1);
    expect(res.name).toEqual('foo');
    done();
  });

  it('update', async done => {
    await service.update(1, {
      project_id: 1,
      name: 'foo1',
      scripts: 'bar1',
      branch_filter: '',
      update_user: null,
    });
    const res = await service.querySingle(1);
    expect(res.name).toEqual('foo1');
    done();
  });

  it('delete', async done => {
    await service.delete(1);
    const res = await service.querySingle(1);
    expect(res).toBeUndefined();
    done();
  });
});
