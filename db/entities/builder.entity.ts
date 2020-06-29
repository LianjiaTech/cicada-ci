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

@Entity('t_builder')
export class Builder {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 50 })
  name: string

  @Index()
  @Column()
  project_id: number

  @Column({ length: 1000 })
  install_scripts: string

  @Column({ length: 1000 })
  build_scripts: string

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
