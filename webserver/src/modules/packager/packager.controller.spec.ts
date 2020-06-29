import { Test, TestingModule } from '@nestjs/testing';
import { PackagerController } from './packager.controller';
import { PackagerService } from './packager.service';
import { Packager } from '~/db/entities/packager.entity';
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

describe('Packager Controller', () => {
  let controller: PackagerController;
  let testUserRequest: Request;

  beforeAll(async () => {
    await createTestConnection();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PackagerController],
      providers: [
        PackagerService,
        getRepositoryProvider(Packager),
        UserService,
        getRepositoryProvider(User),
      ],
    }).compile();

    controller = module.get<PackagerController>(PackagerController);
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
        project_id: 1,
        package_name: 'foo',
        dist_path: 'bar',
      },
      testUserRequest,
    );
    expect(res.id).toEqual(1);
    done();
  });

  it('query list', async done => {
    const res = await controller.queryList(1);
    expect(res.length).toEqual(1);
    done();
  });

  it('query single', async done => {
    const res = await controller.queryById(1);
    expect(res.package_name).toEqual('foo');
    done();
  });

  it('update', async done => {
    await controller.update(
      1,
      {
        project_id: 1,
        package_name: 'foo1',
        dist_path: 'bar1',
      },
      testUserRequest,
    );
    const res = await controller.queryById(1);
    expect(res.package_name).toEqual('foo1');
    done();
  });

  it('delete', async done => {
    await controller.delete(1);
    const res = await controller.queryById(1).catch(err => err);
    expect(res.status).toEqual(404);
    done();
  });
});
