import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { QnA } from './qna.entity';

@Entity('answers')
@Index(['qnaId', 'isAccepted'])
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  qnaId: string;

  @ManyToOne(() => QnA)
  @JoinColumn({ name: 'qnaId' })
  qna: QnA;

  @Column()
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: false })
  isAccepted: boolean;

  @Column({ default: 0 })
  votes: number;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}