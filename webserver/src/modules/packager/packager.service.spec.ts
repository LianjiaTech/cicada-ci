import { Test, TestingModule } from '@nestjs/testing';
import { PackagerService } from './packager.service';
import { Packager } from '~/db/entities/packager.entity';
import {
  createTestConnection,
  getRepositoryProvider,
  closeConnection,
} from '~/utils/test-utils';

describe('PackagerService', () => {
  let service: PackagerService;

  beforeAll(async () => {
    await createTestConnection();
    const module: TestingModule = await Test.createTestingModule({
      providers: [PackagerService, getRepositoryProvider(Packager)],
    }).compile();

    service = module.get<PackagerService>(PackagerService);
  });

  afterAll(closeConnection);

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create', async done => {
    const res = await service.create({
      project_id: 1,
      package_name: 'foo',
      dist_path: 'bar',
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
    expect(res.package_name).toEqual('foo');
    done();
  });

  it('update', async done => {
    await service.update(1, {
      project_id: 1,
      package_name: 'foo1',
      dist_path: 'bar1',
      update_user: null,
    });
    const res = await service.querySingle(1);
    expect(res.package_name).toEqual('foo1');
    done();
  });

  it('delete', async done => {
    await service.delete(1);
    const res = await service.querySingle(1);
    expect(res).toBeUndefined();
    done();
  });
});
