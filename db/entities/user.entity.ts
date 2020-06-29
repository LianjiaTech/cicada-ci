import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type GitFrom = 'github' | 'gitlab';

@Entity('t_user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  account: string;

  @Column()
  from: GitFrom;

  //github: 1~39 for username
  @Column({ length: 39 })
  name: string;

  //with oauth from github or gitlab
  @Column({ select: false })
  git_token: string;

  @Column({ default: 0 })
  admin_level: number;

  @CreateDateColumn()
  create_time: Date;

  @UpdateDateColumn()
  update_time: Date;
}
