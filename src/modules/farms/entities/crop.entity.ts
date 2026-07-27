import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Farm } from './farm.entity';

export enum CropStage {
  PLANTING = 'planting',
  GERMINATION = 'germination',
  VEGETATIVE = 'vegetative',
  FLOWERING = 'flowering',
  HARVESTED = 'harvested',
}

@Entity('crops')
@Index(['farmId'])
export class Crop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  farmId: string;

  @ManyToOne(() => Farm)
  @JoinColumn({ name: 'farmId' })
  farm: Farm;

  @Column()
  name: string;

  @Column()
  variety: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  area: number;

  @Column()
  plantingDate: Date;

  @Column({ nullable: true })
  expectedHarvest: Date;

  @Column({ nullable: true })
  actualHarvest: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  yieldEstimate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualYield: number;

  @Column({
    type: 'enum',
    enum: CropStage,
    default: CropStage.PLANTING,
  })
  stage: CropStage;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}