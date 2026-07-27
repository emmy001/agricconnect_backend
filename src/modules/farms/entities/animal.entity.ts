import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Farm } from './farm.entity';
import { HealthRecord } from './health-record.entity';
import { Vaccination } from './vaccination.entity';

export enum AnimalHealthStatus {
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  CRITICAL = 'critical',
}

@Entity('animals')
@Index(['farmId'])
export class Animal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  farmId: string;

  @ManyToOne(() => Farm)
  @JoinColumn({ name: 'farmId' })
  farm: Farm;

  @Column()
  type: string;

  @Column()
  name: string;

  @Column()
  breed: string;

  @Column()
  age: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight: number;

  @Column({ nullable: true })
  tagId: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  purchaseDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  purchasePrice: number;

  @Column({
    type: 'enum',
    enum: AnimalHealthStatus,
    default: AnimalHealthStatus.GOOD,
  })
  healthStatus: AnimalHealthStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => HealthRecord, (record) => record.animal, { cascade: true })
  healthRecords: HealthRecord[];

  @OneToMany(() => Vaccination, (vacc) => vacc.animal, { cascade: true })
  vaccinations: Vaccination[];
}