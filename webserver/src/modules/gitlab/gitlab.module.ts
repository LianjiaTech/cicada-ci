import { Module, HttpModule } from '@nestjs/common';
import { GitlabService } from './gitlab.service';
import { GitlabController } from './gitlab.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule, HttpModule],
  providers: [GitlabService],
  controllers: [GitlabController],
})
export class GitlabModule {}
