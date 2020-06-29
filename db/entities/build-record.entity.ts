import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Project } from './project.entity';
import { Job } from './job.entity';

export interface GithubCommit {
  id: string;
  tree_id: string;
  message: string;
  timestamp?: string;
  author: { name: string; email: string };
  committer: { name: string; email: string };
  added?: string[];
  removed?: string[];
  modified?: string[];
}

export interface GitlabCommit {
  id: string;
  author_email: string;
  author_name: string;
  committer_email: string;
  message: string;
}

export enum BuildStatus {
  INIT = '初始化',
  INQUEUE = '队列中',
  PROCESSING = '进行中',
  SUCCESS = '已完成',
  FAIL = '已失败',
  ABORT = '已取消',
  TIMEOUT = '已超时',
}

export interface PackageSize {
  package_name: string;
  size: number;
}

export interface BuildRecordExtra {
  pack_from_cache: boolean;
}

@Entity('t_build_record')
export class BuildRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  project_id: number;

  @ManyToOne(type => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ nullable: true })
  job_id: number;

  @ManyToOne(type => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column()
  branch: string;

  @Column('simple-json')
  commits: GithubCommit[];

  @Column({
    type: 'enum',
    enum: BuildStatus,
    default: BuildStatus.INIT,
  })
  status: BuildStatus;

  @Column({ default: 0 })
  duration: number;

  @Column('simple-json', { default: null })
  package_sizes: PackageSize[];

  @Column({ type: 'longtext', select: false, default: null })
  log: string;

  @Column()
  source: string;

  @Column('simple-json', { default: null })
  extra: BuildRecordExtra;

  @Column()
  @CreateDateColumn()
  create_time: Date;

  @UpdateDateColumn()
  update_time: Date;
}
