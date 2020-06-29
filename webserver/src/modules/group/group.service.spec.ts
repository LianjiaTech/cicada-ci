import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from './group.service';
import { Group } from '~/db/entities/group.entity';
import {
  createTestConnection,
  getRepositoryProvider,
  closeConnection,
} from '~/utils/test-utils';

describe('GroupService', () => {
  let service: GroupService;

  beforeAll(async () => {
    await createTestConnection();
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupService, getRepositoryProvider(Group)],
    }).compile();

    service = module.get<GroupService>(GroupService);
  });

  afterAll(closeConnection);

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create', async done => {
    const res = await service.create({
      name: 'foo',
      projects: [],
      admins: [],
      create_user: null,
    });
    expect(res.id).toEqual(1);
    done();
  });

  it('query list', async done => {
    const res = await service.queryList({ page_size: 10, page: 0 });
    expect(res.total).toEqual(1);
    expect(res.results.length).toEqual(1);
    expect(res.results[0].id).toEqual(1);
    done();
  });

  it('query basic info of all groups', async done => {
    const res = await service.queryListAll();
    expect(res.length).toEqual(1);
    expect(Object.keys(res[0])).toEqual(['id', 'name']);
    done();
  });

  it('query single', async done => {
    const res = await service.querySingle(1);
    expect(res.name).toEqual('foo');
    done();
  });

  it('update', async done => {
    await service.update(1, {
      name: 'bar',
      projects: [],
      admins: [],
      update_user: null,
    });
    const res = await service.querySingle(1);
    expect(res.name).toEqual('bar');
    done();
  });

  it('delete', async done => {
    await service.delete(1);
    const res = await service.querySingle(1);
    expect(res).toBeUndefined();
    done();
  });
});
