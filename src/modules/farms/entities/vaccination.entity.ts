import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Animal } from './animal.entity';

export enum VaccinationStatus {
  PENDING = 'pending',
  ADMINISTERED = 'administered',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

@Entity('vaccinations')
@Index(['animalId'])
export class Vaccination {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  animalId: string;

  @ManyToOne(() => Animal)
  @JoinColumn({ name: 'animalId' })
  animal: Animal;

  @Column()
  name: string;

  @Column({ nullable: true })
  vaccineType: string;

  @Column()
  dueDate: Date;

  @Column({ nullable: true })
  administeredDate: Date;

  @Column({ nullable: true })
  administeredBy: string;

  @Column({ nullable: true })
  batchNumber: string;

  @Column({ nullable: true })
  nextDueDate: Date;

  @Column({
    type: 'enum',
    enum: VaccinationStatus,
    default: VaccinationStatus.PENDING,
  })
  status: VaccinationStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}