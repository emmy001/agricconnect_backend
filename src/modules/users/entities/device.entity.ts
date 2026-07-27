import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ unique: true })
  deviceId: string;

  @Column()
  deviceName: string;

  @Column()
  deviceModel: string;

  @Column()
  osVersion: string;

  @Column({ nullable: true })
  pushToken: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastActive: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}