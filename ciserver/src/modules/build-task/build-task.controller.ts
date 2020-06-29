import { Controller, Param, Post } from '@nestjs/common';
import { BuildTaskService } from './build-task.service';

@Controller('build-task')
export class BuildTaskController {
  constructor(private readonly buildTaskService: BuildTaskService) {}

  @Post(':id/abort')
  buildAbort(@Param('id') id: number) {
    this.buildTaskService.abort(+id);
    return 'ok';
  }
}
