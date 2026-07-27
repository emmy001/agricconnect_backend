import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Answer } from './answer.entity';

@Entity('qna')
@Index(['authorId', 'isAnswered'])
export class QnA {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: false })
  isAnswered: boolean;

  @Column({ nullable: true })
  expertId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'expertId' })
  expert: User;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ default: 0 })
  votes: number;

  @Column({ default: 0 })
  answersCount: number;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Answer, (answer) => answer.qna)
  answers: Answer[];
}