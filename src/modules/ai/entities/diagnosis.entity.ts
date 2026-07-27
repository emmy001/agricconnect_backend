import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum DiagnosisSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('diagnoses')
@Index(['userId'])
export class Diagnosis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  diseaseName: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  confidence: number;

  @Column({
    type: 'enum',
    enum: DiagnosisSeverity,
    default: DiagnosisSeverity.MEDIUM,
  })
  severity: DiagnosisSeverity;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  recommendedProfessionalId: string;

  @Column({ type: 'simple-array', nullable: true })
  recommendedActions: string[];

  @Column({ type: 'simple-array', nullable: true })
  preventionTips: string[];

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  detectedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}