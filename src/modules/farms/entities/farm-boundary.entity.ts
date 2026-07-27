import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Farm } from './farm.entity';

@Entity('farm_boundaries')
export class FarmBoundary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  farmId: string;

  @OneToOne(() => Farm)
  @JoinColumn({ name: 'farmId' })
  farm: Farm;

  @Column({ type: 'jsonb' })
  points: { latitude: number; longitude: number }[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  area: number;

  @Column({ default: 'polygon' })
  type: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}