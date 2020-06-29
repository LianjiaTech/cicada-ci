import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  Index
} from 'typeorm'
import { User } from './user.entity'

@Entity('t_packager')
export class Packager {
  @PrimaryGeneratedColumn()
  id: number

  @Index()
  @Column()
  project_id: number

  @Column()
  package_name: string

  @Column()
  dist_path: string

  @ManyToOne(type => User)
  @JoinColumn({ name: 'create_uid' })
  create_user: User

  @ManyToOne(type => User)
  @JoinColumn({ name: 'update_uid' })
  update_user: User

  @CreateDateColumn()
  create_time: Date

  @UpdateDateColumn()
  update_time: Date
}
