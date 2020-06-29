import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BuildRecord } from './build-record.entity';
import { Deployer } from './deployer.entity';
import { User } from './user.entity';

export enum DeployStatus {
  INIT = '初始化',
  PROCESSING = '进行中',
  SUCCESS = '已完成',
  FAIL = '已失败',
  ABORT = '已取消',
  TIMEOUT = '已超时',
}

@Entity('t_deploy_record')
export class DeployRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  build_id: number;

  @ManyToOne(type => BuildRecord, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'build_id' })
  buildRecord: BuildRecord;

  @Column({ nullable: true })
  deployer_id: number;

  @ManyToOne(type => Deployer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deployer_id' })
  deployer: Deployer;

  @Column({
    type: 'enum',
    enum: DeployStatus,
    default: DeployStatus.INIT,
  })
  status: DeployStatus;

  @Column({ default: 0 })
  duration: number;

  @Column({ type: 'longtext', select: false, default: null })
  log: string;

  @Column({ default: false })
  is_auto: boolean;

  @ManyToOne(type => User, { nullable: true })
  @JoinColumn({ name: 'create_uid' })
  create_user: User;

  @Column()
  @CreateDateColumn()
  create_time: Date;

  @UpdateDateColumn()
  update_time: Date;
}
