import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Professional } from './professional.entity';

@Entity('working_hours')
export class WorkingHour {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  professionalId: string;

  @ManyToOne(() => Professional)
  @JoinColumn({ name: 'professionalId' })
  professional: Professional;

  @Column()
  day: string; // Monday, Tuesday, etc.

  @Column({ default: true })
  isWorking: boolean;

  @Column()
  startTime: string; // HH:mm format

  @Column()
  endTime: string; // HH:mm format

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}