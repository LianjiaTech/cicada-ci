import { Test, TestingModule } from '@nestjs/testing';
import { BuilderService } from './builder.service';
import { Builder } from '~/db/entities/builder.entity';
import {
  createTestConnection,
  getRepositoryProvider,
  closeConnection,
} from '~/utils/test-utils';

describe('BuilderService', () => {
  let service: BuilderService;

  beforeAll(async () => {
    await createTestConnection();
    const module: TestingModule = await Test.createTestingModule({
      providers: [BuilderService, getRepositoryProvider(Builder)],
    }).compile();

    service = module.get<BuilderService>(BuilderService);
  });

  afterAll(closeConnection);

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create', async done => {
    const res = await service.create({
      project_id: 1,
      name: 'foo',
      install_scripts: 'bar',
      build_scripts: 'baz',
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
      install_scripts: 'bar1',
      build_scripts: 'baz1',
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
