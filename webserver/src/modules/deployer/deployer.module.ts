import { Module } from '@nestjs/common';
import { DeployerService } from './deployer.service';
import { DeployerController } from './deployer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deployer } from '~/db/entities/deployer.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Deployer]), UserModule],
  providers: [DeployerService],
  controllers: [DeployerController],
})
export class DeployerModule {}
