import { Module, HttpModule } from '@nestjs/common';
import { OauthService } from './oauth.service';
import { UserModule } from '~/modules/user/user.module';
import { OauthController } from './oauth.controller';

@Module({
  imports: [HttpModule, UserModule],
  controllers: [OauthController],
  providers: [OauthService],
})
export class OauthModule {}
