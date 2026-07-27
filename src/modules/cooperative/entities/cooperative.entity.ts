import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { CooperativeMember } from './cooperative-member.entity';
import { CooperativeService as CooperativeServiceEntity } from './cooperative-service.entity';

@Entity('cooperatives')
@Index(['name'])
export class Cooperative {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  logo: string;

  @Column()
  category: string;

  @Column()
  location: string;

  @Column({ default: 0 })
  memberCount: number;

  @Column({ default: 0 })
  servicesCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalSavings: number;

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    requiresApproval: boolean;
    maxMembers: number;
    subscriptionFee: number;
  };

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CooperativeMember, (member) => member.cooperative)
  members: CooperativeMember[];

  @OneToMany(() => CooperativeServiceEntity, (service) => service.cooperative)
  services: CooperativeServiceEntity[];
}