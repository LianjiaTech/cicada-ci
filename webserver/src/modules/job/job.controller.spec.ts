import { Test, TestingModule } from '@nestjs/testing';
import { JobController } from './job.controller';
import { UserService } from '../user/user.service';
import { JobService } from './job.service';
import { Job } from '~/db/entities/job.entity';
import {
  createTestConnection,
  getRepositoryProvider,
  closeConnection,
  PROJECT_TEST,
  USER_TEST,
  getTestUserRequest,
} from '~/utils/test-utils';
import { User } from '~/db/entities/user.entity';
import { ProjectService } from '../project/project.service';
import { Project } from '~/db/entities/project.entity';
import { Request } from 'express';

describe('Job Controller', () => {
  let controller: JobController;
  let testProject: Project;
  let testUserRequest: Request;

  beforeAll(async () => {
    await createTestConnection();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobController],
      providers: [
        JobService,
        getRepositoryProvider(Job),
        UserService,
        getRepositoryProvider(User),
        ProjectService,
        getRepositoryProvider(Project),
      ],
    }).compile();

    controller = module.get<JobController>(JobController);
    //create project beforeAll
    const projectService = module.get<ProjectService>(ProjectService);
    testProject = await projectService.create(PROJECT_TEST);
    //create user before test below
    const userService = module.get<UserService>(UserService);
    const testUser = await userService.testLogin(USER_TEST);
    testUserRequest = getTestUserRequest(testUser);
  });

  afterAll(closeConnection);

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create', async done => {
    const res = await controller.create(
      {
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
      },
      testUserRequest,
    );
    expect(res.id).toEqual(1);
    done();
  });

  it('query list', async done => {
    const res = await controller.queryList({ project_id: 1 });
    expect(res.length).toEqual(1);
    done();
  });

  it('query single', async done => {
    const res = await controller.queryById(1);
    expect(res.name).toEqual('foo');
    done();
  });

  it('update', async done => {
    await controller.update(
      1,
      {
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
      },
      testUserRequest,
    );
    const res = await controller.queryById(1);
    expect(res.name).toEqual('foo1');
    done();
  });

  it('delete', async done => {
    await controller.delete(1);
    const res = await controller.queryById(1).catch(err => err);
    expect(res.status).toEqual(404);
    done();
  });
});
