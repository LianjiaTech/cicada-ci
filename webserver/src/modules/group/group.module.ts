import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { UserModule } from '../user/user.module';
import { Group } from '~/db/entities/group.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Group]), UserModule],
  providers: [GroupService],
  controllers: [GroupController],
})
export class GroupModule {}
