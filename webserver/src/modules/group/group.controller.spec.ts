import { Test, TestingModule } from '@nestjs/testing';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { Group } from '~/db/entities/group.entity';
import {
  createTestConnection,
  getRepositoryProvider,
  closeConnection,
  USER_TEST,
  getTestUserRequest,
} from '~/utils/test-utils';
import { UserService } from '../user/user.service';
import { User } from '~/db/entities/user.entity';
import { Request } from 'express';

describe('Group Controller', () => {
  let controller: GroupController;
  let testUserRequest: Request;

  beforeAll(async () => {
    await createTestConnection();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupController],
      providers: [
        GroupService,
        getRepositoryProvider(Group),
        UserService,
        getRepositoryProvider(User),
      ],
    }).compile();

    controller = module.get<GroupController>(GroupController);
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
        projects: [],
        admins: [],
      },
      testUserRequest,
    );
    expect(res.id).toEqual(1);
    done();
  });

  it('query list', async done => {
    const res = await controller.queryList({ page_size: 10, page: 0 });
    expect(res.total).toEqual(1);
    expect(res.results.length).toEqual(1);
    expect(res.results[0].id).toEqual(1);
    done();
  });

  it('query basic info of all groups', async done => {
    const res = await controller.queryListAll();
    expect(res.length).toEqual(1);
    expect(Object.keys(res[0])).toEqual(['id', 'name']);
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
        name: 'bar',
        projects: [],
        admins: [],
      },
      testUserRequest,
    );
    const res = await controller.queryById(1);
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
