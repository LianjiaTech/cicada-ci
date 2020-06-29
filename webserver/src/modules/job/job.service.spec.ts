import { Test, TestingModule } from '@nestjs/testing';
import { JobService } from './job.service';
import { Job } from '~/db/entities/job.entity';
import {
  createTestConnection,
  getRepositoryProvider,
  closeConnection,
  PROJECT_TEST,
} from '~/utils/test-utils';
import { Project } from '~/db/entities/project.entity';
import { ProjectService } from '../project/project.service';

describe('JobService', () => {
  let service: JobService;
  let testProject: Project;

  beforeAll(async () => {
    await createTestConnection();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobService,
        getRepositoryProvider(Job),
        ProjectService,
        getRepositoryProvider(Project),
      ],
    }).compile();

    service = module.get<JobService>(JobService);
    //create project beforeAll
    const projectService = module.get<ProjectService>(ProjectService);
    testProject = await projectService.create(PROJECT_TEST);
  });

  afterAll(closeConnection);

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create', async done => {
    const res = await service.create({
      name: 'foo',
      project: testProject,
      branches: ['bar'],
      builder: null,
      packagers: [],
      deployers: [],
      auto_build: false,
      auto_deploy: false,
      after_build_hook: '',
      after_deploy_hook: '',
      disable_cache: false,
      create_user: null,
    });
    expect(res.id).toEqual(1);
    done();
  });
  it('query list', async done => {
    const res = await service.queryList({ project_id: testProject.id });
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
      name: 'foo1',
      project: testProject,
      branches: ['bar1'],
      builder: null,
      packagers: [],
      deployers: [],
      auto_build: true,
      auto_deploy: true,
      after_build_hook: '',
      after_deploy_hook: '',
      disable_cache: true,
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
