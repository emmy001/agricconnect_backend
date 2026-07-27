import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('community')
@Controller('community')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  // Posts
  @Post('posts')
  @ApiOperation({ summary: 'Create post' })
  async createPost(@CurrentUser() user: User, @Body() data: any) {
    return this.communityService.createPost(user.id, data);
  }

  @Get('posts')
  @ApiOperation({ summary: 'Get posts' })
  async getPosts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.communityService.getPosts({ page, limit, category, search });
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Get post by ID' })
  async getPost(@Param('id') id: string) {
    return this.communityService.getPost(id);
  }

  @Put('posts/:id')
  @ApiOperation({ summary: 'Update post' })
  async updatePost(@Param('id') id: string, @Body() data: any) {
    return this.communityService.updatePost(id, data);
  }

  @Delete('posts/:id')
  @ApiOperation({ summary: 'Delete post' })
  async deletePost(@Param('id') id: string) {
    return this.communityService.deletePost(id);
  }

  @Post('posts/:id/like')
  @ApiOperation({ summary: 'Like post' })
  async likePost(@Param('id') id: string, @CurrentUser() user: User) {
    return this.communityService.likePost(id, user.id);
  }

  @Post('posts/:id/unlike')
  @ApiOperation({ summary: 'Unlike post' })
  async unlikePost(@Param('id') id: string, @CurrentUser() user: User) {
    return this.communityService.unlikePost(id, user.id);
  }

  // Comments
  @Post('posts/:id/comments')
  @ApiOperation({ summary: 'Add comment' })
  async addComment(@Param('id') id: string, @CurrentUser() user: User, @Body('content') content: string) {
    return this.communityService.addComment(id, user.id, content);
  }

  @Get('posts/:id/comments')
  @ApiOperation({ summary: 'Get comments' })
  async getComments(@Param('id') id: string) {
    return this.communityService.getComments(id);
  }

  // Q&A
  @Post('qna')
  @ApiOperation({ summary: 'Ask question' })
  async askQuestion(@CurrentUser() user: User, @Body() data: any) {
    return this.communityService.askQuestion(user.id, data);
  }

  @Get('qna')
  @ApiOperation({ summary: 'Get Q&A' })
  async getQnA(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('isAnswered') isAnswered?: boolean,
  ) {
    return this.communityService.getQnA({ page, limit, isAnswered });
  }

  @Get('qna/:id')
  @ApiOperation({ summary: 'Get Q&A by ID' })
  async getQnAById(@Param('id') id: string) {
    return this.communityService.getQnAById(id);
  }

  @Post('qna/:id/answer')
  @ApiOperation({ summary: 'Answer question' })
  async answerQuestion(@Param('id') id: string, @CurrentUser() user: User, @Body('content') content: string) {
    return this.communityService.answerQuestion(id, user.id, content);
  }

  @Post('qna/:id/accept/:answerId')
  @ApiOperation({ summary: 'Accept answer' })
  async acceptAnswer(@Param('id') id: string, @Param('answerId') answerId: string) {
    return this.communityService.acceptAnswer(id, answerId);
  }

  // Articles
  @Get('articles')
  @ApiOperation({ summary: 'Get articles' })
  async getArticles(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('category') category?: string,
  ) {
    return this.communityService.getArticles({ page, limit, category });
  }

  @Get('articles/:id')
  @ApiOperation({ summary: 'Get article by ID' })
  async getArticle(@Param('id') id: string) {
    return this.communityService.getArticle(id);
  }

  // Webinars
  @Get('webinars')
  @ApiOperation({ summary: 'Get webinars' })
  async getWebinars(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('upcoming') upcoming?: boolean,
  ) {
    return this.communityService.getWebinars({ page, limit, upcoming });
  }

  @Get('webinars/:id')
  @ApiOperation({ summary: 'Get webinar by ID' })
  async getWebinar(@Param('id') id: string) {
    return this.communityService.getWebinar(id);
  }

  @Post('webinars/:id/register')
  @ApiOperation({ summary: 'Register for webinar' })
  async registerWebinar(@Param('id') id: string, @CurrentUser() user: User) {
    return this.communityService.registerWebinar(id, user.id);
  }
}