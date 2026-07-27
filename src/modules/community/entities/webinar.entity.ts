import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('webinars')
@Index(['speakerId', 'date'])
export class Webinar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  speakerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'speakerId' })
  speaker: User;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  date: Date;

  @Column()
  time: string;

  @Column({ default: 0 })
  attendees: number;

  @Column({ default: 100 })
  maxAttendees: number;

  @Column({ default: false })
  isLive: boolean;

  @Column({ nullable: true })
  recordingUrl: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}