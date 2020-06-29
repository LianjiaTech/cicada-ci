import { Test, TestingModule } from '@nestjs/testing';
import { BuildTaskController } from './build-task.controller';

describe('BuildTask Controller', () => {
  let controller: BuildTaskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuildTaskController],
    }).compile();

    controller = module.get<BuildTaskController>(BuildTaskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
