import { Controller, Post, Param } from '@nestjs/common';
import { QueueService } from './queue.service';

@Controller('build-queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post(':id/add')
  async addToQueue(@Param('id') id: number) {
    await this.queueService.add(+id);
    return 'ok';
  }

  @Post(':id/remove')
  async removeFromQueue(@Param('id') id: number) {
    await this.queueService.remove(+id);
    return 'ok';
  }
}
