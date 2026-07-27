import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('weather_forecasts')
@Index(['userId'])
export class WeatherForecast {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  location: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  temperature: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  humidity: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  windSpeed: number;

  @Column()
  condition: string;

  @Column({ type: 'jsonb', nullable: true })
  daily: { day: string; minTemp: number; maxTemp: number; precipitation: number; condition: string }[];

  @Column({ type: 'simple-array', nullable: true })
  recommendations: string[];

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  date: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}