import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Cooperative } from './cooperative.entity';
import { User } from '../../users/entities/user.entity';

export enum GroupBookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('group_bookings')
@Index(['cooperativeId', 'status'])
export class GroupBooking {
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

  @Column({ type: 'simple-array' })
  serviceIds: string[];

  @Column({ default: 1 })
  memberCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  finalAmount: number;

  @Column({
    type: 'enum',
    enum: GroupBookingStatus,
    default: GroupBookingStatus.PENDING,
  })
  status: GroupBookingStatus;

  @Column({ nullable: true })
  scheduledDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}