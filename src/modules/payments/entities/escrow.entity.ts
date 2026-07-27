import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Payment } from './payment.entity';
import { User } from '../../users/entities/user.entity';

export enum EscrowStatus {
  HOLDING = 'holding',
  RELEASED = 'released',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
}

@Entity('escrow')
@Index(['paymentId', 'status'])
export class Escrow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  paymentId: string;

  @ManyToOne(() => Payment)
  @JoinColumn({ name: 'paymentId' })
  payment: Payment;

  @Column()
  payerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'payerId' })
  payer: User;

  @Column()
  payeeId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'payeeId' })
  payee: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'KES' })
  currency: string;

  @Column({
    type: 'enum',
    enum: EscrowStatus,
    default: EscrowStatus.HOLDING,
  })
  status: EscrowStatus;

  @Column({ nullable: true })
  releaseDate: Date;

  @Column({ nullable: true })
  releasedTo: string;

  @Column({ nullable: true })
  releasedBy: string;

  @Column({ type: 'jsonb', nullable: true })
  conditions: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}