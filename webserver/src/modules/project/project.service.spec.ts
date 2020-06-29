import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { Project } from '~/db/entities/project.entity';
import {
  createTestConnection,
  getRepositoryProvider,
  closeConnection,
  PROJECT_TEST,
} from '~/utils/test-utils';

describe('ProjectService', () => {
  let service: ProjectService;

  beforeAll(async () => {
    await createTestConnection();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectService, getRepositoryProvider(Project)],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
  });

  afterAll(closeConnection);

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create project', async done => {
    const res = await service.create(PROJECT_TEST);
    expect(res.id).toEqual(1);
    done();
  });

  it('update project', async done => {
    const res = await service.update(1, {
      name: 'bar',
      clone_with_ssh: true,
      enable_webhook: true,
      group: null,
      admins: [],
      adv_configs: { enable_deps_cache: true, install_type: 1 },
      update_user: null,
    });
    expect(res.name).toEqual('bar');
    done();
  });

  it('length of list should be 1', async done => {
    const res = await service.queryList(
      {
        page: 0,
        page_size: 10,
        keywords: '',
        created: false,
        git_from: 'github',
      },
      1,
    );
    expect(res.total).toEqual(1);
    expect(res.results.length).toEqual(1);
    expect(res.results[0].name).toEqual('bar');
    done();
  });

  it('query by id should return test project', async done => {
    const project = await service.querySingle(1);
    expect(project.name).toEqual('bar');
    done();
  });

  it('delete by id should worked', async done => {
    await service.delete(1);
    const res = await service.querySingle(1);
    expect(res).toBeUndefined();
    done();
  });
});
