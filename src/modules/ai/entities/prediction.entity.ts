import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('predictions')
@Index(['userId'])
export class Prediction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  cropType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  predictedYield: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  confidence: number;

  @Column()
  bestSeason: string;

  @Column({ type: 'jsonb' })
  factors: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  monthlyPredictions: { month: string; yield: number; temperature: number; rainfall: number }[];

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}