import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from '~/db/entities/user.entity';
import {
  createTestConnection,
  getRepositoryProvider,
  USER_TEST,
  closeConnection,
} from '~/utils/test-utils';

describe('UserService', () => {
  let service: UserService;

  beforeAll(async () => {
    await createTestConnection();
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, getRepositoryProvider(User)],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterAll(closeConnection);

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('testlogin', async done => {
    const res = await service.testLogin(USER_TEST);
    expect(res.account).toEqual('foo');
    done();
  });

  it('length of queryList should be 1', async done => {
    const list = await service.queryList();
    expect(list.length).toEqual(1);
    done();
  });

  it('queryById should return testuser', async done => {
    const user = await service.queryById(1);
    expect(user.account).toEqual('foo');
    done();
  });

  it('queryByIds should return [testuser]', async done => {
    const users = await service.queryByIds([1]);
    expect(users.length).toEqual(1);
    expect(users[0].account).toEqual('foo');
    done();
  });

  it('search keyword match account or name', async done => {
    const search1 = await service.search('fo');
    expect(search1.length).toEqual(1);
    const search2 = await service.search('ba');
    expect(search2.length).toEqual(1);
    expect(search1).toEqual(search2);
    done();
  });

  it('adminlevel get and set should work as expected', async done => {
    let admins = await service.queryAdminList();
    expect(admins.length).toEqual(0);
    await service.updateAdminLevel(1, { admin_level: 1 });
    admins = await service.queryAdminList();
    expect(admins.length).toEqual(1);
    done();
  });

  it('no users after delete testuser', async done => {
    await service.delete(1);
    const list = await service.queryList();
    expect(list.length).toEqual(0);
    done();
  });
});
