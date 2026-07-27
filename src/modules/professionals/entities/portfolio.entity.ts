import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Professional } from './professional.entity';

export enum PortfolioType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

@Entity('portfolio')
export class Portfolio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  professionalId: string;

  @ManyToOne(() => Professional)
  @JoinColumn({ name: 'professionalId' })
  professional: Professional;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  url: string;

  @Column({
    type: 'enum',
    enum: PortfolioType,
    default: PortfolioType.IMAGE,
  })
  type: PortfolioType;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ default: 0 })
  order: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}