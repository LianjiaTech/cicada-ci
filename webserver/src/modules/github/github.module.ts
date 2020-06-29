import { Module, HttpModule } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [HttpModule, UserModule],
  providers: [GithubService],
  controllers: [GithubController],
})
export class GithubModule {}
