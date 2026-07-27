import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Certification } from './certification.entity';
import { WorkingHour } from './working-hour.entity';
import { Portfolio } from './portfolio.entity';

export enum ProfessionalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

@Entity('professionals')
export class Professional {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'text', nullable: true })
  specialty: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, default: 0 })
  experienceYears: number;

  @Column({ default: 0 })
  responseTime: number; // in minutes

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  acceptanceRate: number;

  @Column({ default: 0 })
  jobsCompleted: number;

  @Column({ default: false })
  isAvailable: boolean;

  @Column({ default: false })
  hasVehicle: boolean;

  @Column({ type: 'jsonb', nullable: true })
  pricing: {
    basePrice: number;
    emergencyFee: number;
    distanceFeePerKm: number;
    minimumPrice: number;
    maximumPrice: number;
    currency: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };

  @Column({ type: 'simple-array', nullable: true })
  skills: string[];

  @Column({ type: 'simple-array', nullable: true })
  languages: string[];

  @Column({ type: 'simple-array', nullable: true })
  equipment: string[];

  @Column({
    type: 'enum',
    enum: ProfessionalStatus,
    default: ProfessionalStatus.PENDING,
  })
  verificationStatus: ProfessionalStatus;

  @Column({ type: 'text', nullable: true })
  verificationNotes: string;

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  verifiedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Certification, (cert) => cert.professional, { cascade: true })
  certifications: Certification[];

  @OneToMany(() => WorkingHour, (hour) => hour.professional, { cascade: true })
  workingHours: WorkingHour[];

  @OneToMany(() => Portfolio, (item) => item.professional, { cascade: true })
  portfolio: Portfolio[];
}