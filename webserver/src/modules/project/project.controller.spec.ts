import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { Project } from '~/db/entities/project.entity';
import {
  createTestConnection,
  getRepositoryProvider,
  USER_TEST,
  getTestUserRequest,
  closeConnection,
  PROJECT_TEST,
} from '~/utils/test-utils';
import { UserService } from '../user/user.service';
import { User } from '~/db/entities/user.entity';

describe('Project Controller', () => {
  let controller: ProjectController;
  let testUserRequest;

  beforeAll(async () => {
    await createTestConnection();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        ProjectService,
        getRepositoryProvider(Project),
        UserService,
        getRepositoryProvider(User),
      ],
    }).compile();

    controller = module.get<ProjectController>(ProjectController);
    //create user before test below
    const userService = module.get<UserService>(UserService);
    const testUser = await userService.testLogin(USER_TEST);
    testUserRequest = getTestUserRequest(testUser);
  });

  afterAll(closeConnection);

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create project', async done => {
    const { create_user, ...createProjectDto } = PROJECT_TEST;
    const res = await controller.create(createProjectDto, testUserRequest);
    expect(res.id).toEqual(1);
    done();
  });

  it('query list', async done => {
    const res = await controller.queryList(
      { page: 0, page_size: 10, keywords: '', created: 'true' },
      testUserRequest,
    );

    expect(res.total).toEqual(1);
    expect(res.results.length).toEqual(1);
    expect(res.results[0].id).toEqual(1);
    done();
  });

  it('query by id', async done => {
    const res = await controller.queryById(1);
    expect(res.name).toEqual('foo');
    done();
  });

  it('update', async done => {
    const res = await controller.update(
      1,
      {
        name: 'bar',
        clone_with_ssh: true,
        enable_webhook: true,
        group: null,
        admins: [],
        adv_configs: { enable_deps_cache: true, install_type: 1 },
      },
      testUserRequest,
    );
    expect(res.name).toEqual('bar');
    done();
  });

  it('delete', async done => {
    await controller.delete(1);
    const res = await controller.queryById(1).catch(err => err);
    expect(res.status).toEqual(404);
    done();
  });
});
