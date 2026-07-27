import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Professional } from './professional.entity';

@Entity('certifications')
export class Certification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  professionalId: string;

  @ManyToOne(() => Professional)
  @JoinColumn({ name: 'professionalId' })
  professional: Professional;

  @Column()
  name: string;

  @Column()
  issuer: string;

  @Column({ nullable: true })
  year: string;

  @Column({ nullable: true })
  certificateUrl: string;

  @Column({ nullable: true })
  expiryDate: Date;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}