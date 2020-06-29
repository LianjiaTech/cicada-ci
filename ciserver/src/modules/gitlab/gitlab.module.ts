import { Module, HttpModule } from '@nestjs/common';
import { GitlabService } from './gitlab.service';

@Module({
  imports: [HttpModule],
  providers: [GitlabService],
  exports: [GitlabService],
})
export class GitlabModule {}
