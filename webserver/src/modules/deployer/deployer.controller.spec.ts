import { Test, TestingModule } from '@nestjs/testing';
import { DeployerController } from './deployer.controller';
import { DeployerService } from './deployer.service';
import { Deployer } from '~/db/entities/deployer.entity';
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

describe('Deployer Controller', () => {
  let controller: DeployerController;
  let testUserRequest: Request;

  beforeAll(async () => {
    await createTestConnection();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeployerController],
      providers: [
        DeployerService,
        getRepositoryProvider(Deployer),
        UserService,
        getRepositoryProvider(User),
      ],
    }).compile();

    controller = module.get<DeployerController>(DeployerController);
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
        name: 'foo',
        scripts: 'bar',
        branch_filter: '',
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
    expect(res.name).toEqual('foo');
    done();
  });

  it('update', async done => {
    await controller.update(
      1,
      {
        project_id: 1,
        name: 'foo1',
        scripts: 'bar1',
        branch_filter: '',
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
