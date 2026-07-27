import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Cooperative } from './cooperative.entity';

export enum MemberRole {
  MEMBER = 'member',
  ADMIN = 'admin',
  CHAIRMAN = 'chairman',
  TREASURER = 'treasurer',
  SECRETARY = 'secretary',
}

@Entity('cooperative_members')
@Index(['cooperativeId', 'userId'], { unique: true })
export class CooperativeMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cooperativeId: string;

  @ManyToOne(() => Cooperative)
  @JoinColumn({ name: 'cooperativeId' })
  cooperative: Cooperative;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: MemberRole,
    default: MemberRole.MEMBER,
  })
  role: MemberRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  joinedAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  contributions: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}