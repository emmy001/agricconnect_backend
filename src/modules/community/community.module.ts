import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { QnA } from './entities/qna.entity';
import { Answer } from './entities/answer.entity';
import { Article } from './entities/article.entity';
import { Webinar } from './entities/webinar.entity';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Comment, QnA, Answer, Article, Webinar]),
    UsersModule,
    NotificationsModule,
  ],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}