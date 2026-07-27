import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, OneToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { FarmBoundary } from './farm-boundary.entity';
import { Animal } from './animal.entity';
import { Crop } from './crop.entity';

export enum FarmType {
  CROPS = 'crops',
  LIVESTOCK = 'livestock',
  MIXED = 'mixed',
  DAIRY = 'dairy',
  POULTRY = 'poultry',
}

@Entity('farms')
@Index(['farmerId'])
export class Farm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  farmerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'farmerId' })
  farmer: User;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: FarmType,
    default: FarmType.MIXED,
  })
  type: FarmType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  size: number;

  @Column({ type: 'jsonb' })
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };

  @Column({ nullable: true })
  registeredNumber: string;

  @OneToOne(() => FarmBoundary, (boundary) => boundary.farm, { cascade: true })
  boundary: FarmBoundary;

  @OneToMany(() => Animal, (animal) => animal.farm, { cascade: true })
  animals: Animal[];

  @OneToMany(() => Crop, (crop) => crop.farm, { cascade: true })
  crops: Crop[];

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}