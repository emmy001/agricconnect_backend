import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Animal } from './animal.entity';

export enum HealthRecordType {
  CHECKUP = 'checkup',
  TREATMENT = 'treatment',
  SURGERY = 'surgery',
  LAB_TEST = 'lab_test',
  VACCINATION = 'vaccination',
  BIRTH = 'birth',
  DEATH = 'death',
  OTHER = 'other',
}

@Entity('health_records')
@Index(['animalId'])
export class HealthRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  animalId: string;

  @ManyToOne(() => Animal)
  @JoinColumn({ name: 'animalId' })
  animal: Animal;

  @Column({
    type: 'enum',
    enum: HealthRecordType,
  })
  type: HealthRecordType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  veterinarian: string;

  @Column({ nullable: true })
  treatment: string;

  @Column({ nullable: true })
  medication: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({ nullable: true })
  diagnosis: string;

  @Column({ nullable: true })
  prognosis: string;

  @Column()
  date: Date;

  @Column({ nullable: true })
  nextCheckup: Date;

  @Column({ default: 'Completed' })
  status: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}