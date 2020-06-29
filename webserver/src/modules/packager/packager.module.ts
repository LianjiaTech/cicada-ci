import { Module } from '@nestjs/common';
import { PackagerService } from './packager.service';
import { PackagerController } from './packager.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Packager } from '~/db/entities/packager.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Packager]), UserModule],
  providers: [PackagerService],
  controllers: [PackagerController],
})
export class PackagerModule {}
