import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { QnA } from './entities/qna.entity';
import { Answer } from './entities/answer.entity';
import { Article } from './entities/article.entity';
import { Webinar } from './entities/webinar.entity';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(QnA)
    private qnaRepository: Repository<QnA>,
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    @InjectRepository(Webinar)
    private webinarRepository: Repository<Webinar>,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  // Post Methods
  async createPost(userId: string, data: any): Promise<Post> {
    const post = this.postRepository.create({
      authorId: userId,
      ...data,
    });
    return this.postRepository.save(post);
  }

  async getPosts(params: { page: number; limit: number; category?: string; search?: string }): Promise<{ data: Post[]; total: number }> {
    const { page, limit, category, search } = params;
    const queryBuilder = this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.isPublished = true');

    if (category) {
      queryBuilder.andWhere('post.category = :category', { category });
    }

    if (search) {
      queryBuilder.andWhere('post.title ILIKE :search OR post.content ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('post.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async getPost(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'comments', 'comments.author'],
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async updatePost(id: string, data: any): Promise<Post> {
    const post = await this.getPost(id);
    Object.assign(post, data);
    return this.postRepository.save(post);
  }

  async deletePost(id: string): Promise<{ success: boolean }> {
    await this.getPost(id);
    await this.postRepository.softDelete(id);
    return { success: true };
  }

  async likePost(postId: string, userId: string): Promise<Post> {
    const post = await this.getPost(postId);
    post.likes += 1;
    return this.postRepository.save(post);
  }

  async unlikePost(postId: string, userId: string): Promise<Post> {
    const post = await this.getPost(postId);
    post.likes -= 1;
    return this.postRepository.save(post);
  }

  // Comment Methods
  async addComment(postId: string, userId: string, content: string): Promise<Comment> {
    await this.getPost(postId);
    const comment = this.commentRepository.create({
      postId,
      authorId: userId,
      content,
    });
    return this.commentRepository.save(comment);
  }

  async getComments(postId: string): Promise<Comment[]> {
    await this.getPost(postId);
    return this.commentRepository.find({
      where: { postId },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });
  }

  // Q&A Methods
  async askQuestion(userId: string, data: any): Promise<QnA> {
    const qna = this.qnaRepository.create({
      authorId: userId,
      ...data,
    });
    return this.qnaRepository.save(qna);
  }

  async getQnA(params: { page: number; limit: number; isAnswered?: boolean }): Promise<{ data: QnA[]; total: number }> {
    const { page, limit, isAnswered } = params;
    const queryBuilder = this.qnaRepository.createQueryBuilder('qna')
      .leftJoinAndSelect('qna.author', 'author')
      .leftJoinAndSelect('qna.expert', 'expert');

    if (isAnswered !== undefined) {
      queryBuilder.andWhere('qna.isAnswered = :isAnswered', { isAnswered });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('qna.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async getQnAById(id: string): Promise<QnA> {
    const qna = await this.qnaRepository.findOne({
      where: { id },
      relations: ['author', 'expert', 'answers', 'answers.author'],
    });
    if (!qna) {
      throw new NotFoundException('Q&A not found');
    }
    return qna;
  }

  async answerQuestion(qnaId: string, userId: string, content: string): Promise<Answer> {
    const qna = await this.getQnAById(qnaId);
    const answer = this.answerRepository.create({
      qnaId,
      authorId: userId,
      content,
    });
    const saved = await this.answerRepository.save(answer);
    
    qna.answersCount += 1;
    await this.qnaRepository.save(qna);
    
    return saved;
  }

  async acceptAnswer(qnaId: string, answerId: string): Promise<{ success: boolean }> {
    const qna = await this.getQnAById(qnaId);
    const answer = await this.answerRepository.findOne({ where: { id: answerId } });
    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    qna.isAnswered = true;
    qna.expertId = answer.authorId;
    await this.qnaRepository.save(qna);

    answer.isAccepted = true;
    await this.answerRepository.save(answer);

    return { success: true };
  }

  // Article Methods
  async getArticles(params: { page: number; limit: number; category?: string }): Promise<{ data: Article[]; total: number }> {
    const { page, limit, category } = params;
    const queryBuilder = this.articleRepository.createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .where('article.isPublished = true');

    if (category) {
      queryBuilder.andWhere('article.category = :category', { category });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('article.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async getArticle(id: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    // Increment views
    article.views += 1;
    await this.articleRepository.save(article);
    return article;
  }

  // Webinar Methods
  async getWebinars(params: { page: number; limit: number; upcoming?: boolean }): Promise<{ data: Webinar[]; total: number }> {
    const { page, limit, upcoming } = params;
    const queryBuilder = this.webinarRepository.createQueryBuilder('webinar')
      .leftJoinAndSelect('webinar.speaker', 'speaker');

    if (upcoming) {
      queryBuilder.andWhere('webinar.date > :now', { now: new Date() });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('webinar.date', 'ASC')
      .getManyAndCount();

    return { data, total };
  }

  async getWebinar(id: string): Promise<Webinar> {
    const webinar = await this.webinarRepository.findOne({
      where: { id },
      relations: ['speaker'],
    });
    if (!webinar) {
      throw new NotFoundException('Webinar not found');
    }
    return webinar;
  }

  async registerWebinar(webinarId: string, userId: string): Promise<{ success: boolean }> {
    const webinar = await this.getWebinar(webinarId);
    if (webinar.attendees >= webinar.maxAttendees) {
      throw new BadRequestException('Webinar is full');
    }
    webinar.attendees += 1;
    await this.webinarRepository.save(webinar);
    return { success: true };
  }
}