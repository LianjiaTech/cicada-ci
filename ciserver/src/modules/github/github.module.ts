import { Module, HttpModule } from '@nestjs/common';
import { GithubService } from './github.service';

@Module({
  imports: [HttpModule],
  providers: [GithubService],
  exports: [GithubService],
})
export class GithubModule {}
