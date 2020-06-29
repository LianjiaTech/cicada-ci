import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '~/db/entities/user.entity';
import {
  createTestConnection,
  getRepositoryProvider,
  USER_TEST,
  closeConnection,
} from '~/utils/test-utils';

describe('User Controller', () => {
  let controller: UserController;

  beforeAll(async () => {
    await createTestConnection();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, getRepositoryProvider(User)],
    }).compile();

    controller = module.get<UserController>(UserController);

    //prepare for default user
    const service = module.get<UserService>(UserService);
    await service.testLogin(USER_TEST);
  });

  afterAll(closeConnection);

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('query list', async done => {
    const res = await controller.queryList();
    expect(res.length).toEqual(1);
    done();
  });

  it('query by id', async done => {
    const res = await controller.queryById({ id: 1 });
    expect(res.account).toEqual('foo');
    done();
  });

  it('search keyword should work for both account and name', async done => {
    const res1 = await controller.search('fo');
    const res2 = await controller.search('ba');
    expect(res1.length).toEqual(1);
    expect(res2.length).toEqual(1);
    expect(res1[0].id).toEqual(res2[0].id);
    done();
  });

  it('get and set adminlevel', async done => {
    let admins = await controller.queryAdminList();
    expect(admins.length).toEqual(0);
    await controller.updateAdminLevel({ id: 1 }, { admin_level: 1 });
    admins = await controller.queryAdminList();
    expect(admins.length).toEqual(1);
    done();
  });

  it('delete by id', async done => {
    await controller.delete({ id: 1 });
    const res = await controller.queryList();
    expect(res.length).toEqual(0);
    done();
  });
});
