import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';
import { Builder } from './builder.entity';
import { Packager } from './packager.entity';
import { Deployer } from './deployer.entity';
import { Project } from './project.entity';

@Entity('t_job')
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  project_id: number;

  @ManyToOne(type => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ length: 50 })
  name: string;

  @Column('simple-array')
  branches: string[];

  @ManyToOne(type => Builder)
  @JoinColumn({ name: 'builder_id' })
  builder: Builder;

  @Column({ default: false })
  auto_build: boolean;

  @Column({ default: false })
  disable_cache: boolean;

  @ManyToMany(type => Packager, {
    cascade: ['insert', 'update', 'remove'],
    onDelete: 'CASCADE',
  })
  @JoinTable({ name: 't_job_packagers' })
  packagers: Packager[];

  @ManyToMany(type => Deployer, {
    cascade: ['insert', 'update', 'remove'],
    onDelete: 'CASCADE',
  })
  @JoinTable({ name: 't_job_deployers' })
  deployers: Deployer[];

  @Column({ default: false })
  auto_deploy: boolean;

  @Column()
  after_build_hook: string;

  @Column()
  after_deploy_hook: string;

  @ManyToOne(type => User)
  @JoinColumn({ name: 'create_uid' })
  create_user: User;

  @ManyToOne(type => User)
  @JoinColumn({ name: 'update_uid' })
  update_user: User;

  @CreateDateColumn()
  create_time: Date;

  @UpdateDateColumn()
  update_time: Date;
}
