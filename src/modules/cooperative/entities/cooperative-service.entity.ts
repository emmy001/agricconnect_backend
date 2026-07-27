import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Cooperative } from './cooperative.entity';

@Entity('cooperative_services')
@Index(['cooperativeId'])
export class CooperativeService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cooperativeId: string;

  @ManyToOne(() => Cooperative)
  @JoinColumn({ name: 'cooperativeId' })
  cooperative: Cooperative;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  discount: number;

  @Column({ nullable: true })
  icon: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}