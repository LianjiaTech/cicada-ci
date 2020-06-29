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
import { User, GitFrom } from './user.entity';
import { Group } from './group.entity';

@Entity('t_project')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 50, unique: true })
  repo_url: string;

  @Column()
  ssh_url: string;

  @Column({ default: false })
  clone_with_ssh: boolean;

  @Column()
  repo_id: number;

  @Column({ default: false })
  enable_webhook: boolean;

  @ManyToOne(
    type => Group,
    group => group.projects,
  )
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @ManyToMany(type => User)
  @JoinTable({ name: 't_project_admins' })
  admins: User[];

  @Column('simple-json')
  adv_configs: { install_type: number; enable_deps_cache: boolean };

  @Column()
  git_from: GitFrom;

  @ManyToOne(type => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'create_uid' })
  create_user: User;

  @ManyToOne(type => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'update_uid' })
  update_user: User;

  @CreateDateColumn()
  create_time: Date;

  @UpdateDateColumn()
  update_time: Date;
}
