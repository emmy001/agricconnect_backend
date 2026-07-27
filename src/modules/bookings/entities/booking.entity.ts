import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Professional } from '../../professionals/entities/professional.entity';

export enum BookingStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EN_ROUTE = 'en_route',
  ARRIVED = 'arrived',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum ServiceCategory {
  VETERINARIAN = 'veterinarian',
  CROP_DOCTOR = 'crop_doctor',
  AGRONOMIST = 'agronomist',
  ARTIFICIAL_INSEMINATION = 'artificial_insemination',
  LIVESTOCK_VACCINATION = 'livestock_vaccination',
  PEST_CONTROL = 'pest_control',
  FARM_EQUIPMENT_REPAIR = 'farm_equipment_repair',
  SOIL_TESTING = 'soil_testing',
  DRONE_SPRAYING = 'drone_spraying',
  IRRIGATION_INSTALLATION = 'irrigation_installation',
  GREENHOUSE_EXPERTS = 'greenhouse_experts',
  POULTRY = 'poultry',
  PIG_FARMING = 'pig_farming',
  DAIRY_FARMING = 'dairy_farming',
  FISH_FARMING = 'fish_farming',
  BEE_KEEPING = 'bee_keeping',
  FARM_LABOUR = 'farm_labour',
  LAND_PREPARATION = 'land_preparation',
  TRACTOR_HIRE = 'tractor_hire',
  SEED_CONSULTATION = 'seed_consultation',
  FERTILIZER_CONSULTATION = 'fertilizer_consultation',
  HARVESTING = 'harvesting',
  TRANSPORT = 'transport',
  STORAGE = 'storage',
  INSURANCE = 'insurance',
  FINANCIAL_SERVICES = 'financial_services',
}

@Entity('bookings')
@Index(['farmerId', 'professionalId', 'status'])
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  farmerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'farmerId' })
  farmer: User;

  @Column({ nullable: true })
  @Index()
  professionalId: string;

  @ManyToOne(() => Professional)
  @JoinColumn({ name: 'professionalId' })
  professional: Professional;

  @Column()
  serviceId: string;

  @Column({
    type: 'enum',
    enum: ServiceCategory,
  })
  category: ServiceCategory;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  @Index()
  status: BookingStatus;

  @CreateDateColumn()
  @Index()
  requestedAt: Date;

  @Column({ nullable: true })
  scheduledStart: Date;

  @Column({ nullable: true })
  scheduledEnd: Date;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ type: 'jsonb' })
  pickupLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };

  @Column({ type: 'jsonb' })
  dropoffLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  distance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  estimatedPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  finalPrice: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ type: 'simple-array', nullable: true })
  documents: string[];

  @Column({ default: false })
  isEmergency: boolean;

  @Column({ nullable: true })
  rating: number;

  @Column({ type: 'text', nullable: true })
  review: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @UpdateDateColumn()
  updatedAt: Date;
}