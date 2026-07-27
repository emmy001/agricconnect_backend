import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  @ApiOperation({ summary: 'Get user chat rooms' })
  async getChatRooms(@CurrentUser() user: User) {
    return this.chatService.getUserChatRooms(user.id);
  }

  @Post('rooms')
  @ApiOperation({ summary: 'Create or get chat room' })
  async createChatRoom(
    @CurrentUser() user: User,
    @Body('professionalId') professionalId: string,
  ) {
    return this.chatService.createChatRoom(user.id, professionalId);
  }

  @Get('rooms/:chatId/messages')
  @ApiOperation({ summary: 'Get chat messages' })
  async getMessages(
    @Param('chatId') chatId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.chatService.getChatMessages(chatId, page, limit);
  }

  @Post('rooms/:chatId/read')
  @ApiOperation({ summary: 'Mark messages as read' })
  async markAsRead(
    @Param('chatId') chatId: string,
    @CurrentUser() user: User,
  ) {
    return this.chatService.markMessagesAsRead(chatId, user.id);
  }

  @Get('users/:userId/online')
  @ApiOperation({ summary: 'Check user online status' })
  async checkOnlineStatus(@Param('userId') userId: string) {
    return this.chatService.checkOnlineStatus(userId);
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Get unread message count' })
  async getUnreadCount(@CurrentUser() user: User) {
    return this.chatService.getUnreadCount(user.id);
  }

  @Post('rooms/:chatId/typing')
  @ApiOperation({ summary: 'Send typing indicator' })
  async sendTyping(
    @Param('chatId') chatId: string,
    @CurrentUser() user: User,
    @Body('isTyping') isTyping: boolean,
  ) {
    return this.chatService.sendTypingIndicator(chatId, user.id, isTyping);
  }
}