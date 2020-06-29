import { Test, TestingModule } from '@nestjs/testing';
import { DeployTaskController } from './deploy-task.controller';

describe('DeployTask Controller', () => {
  let controller: DeployTaskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeployTaskController],
    }).compile();

    controller = module.get<DeployTaskController>(DeployTaskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
