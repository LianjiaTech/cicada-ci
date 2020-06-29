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
  OneToMany
} from 'typeorm'
import { User } from './user.entity'
import { Project } from './project.entity'

@Entity('t_group')
export class Group {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 50, unique: true, charset: 'utf8mb4' })
  name: string

  @OneToMany(
    type => Project,
    project => project.group
  )
  projects: Project[]

  @ManyToMany(type => User)
  @JoinTable({ name: 't_group_admins' })
  admins: User[]

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
