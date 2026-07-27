import { Controller, Get, Put, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create notification' })
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  async findAll(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('type') type?: string,
    @Query('isRead') isRead?: boolean,
  ) {
    return this.notificationsService.findAll(user.id, { page, limit, type, isRead });
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Get unread count' })
  async getUnreadCount(@CurrentUser() user: User) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  async findOne(@Param('id') id: string) {
    return this.notificationsService.findById(id);
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser() user: User) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  async remove(@Param('id') id: string) {
    return this.notificationsService.delete(id);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all notifications' })
  async removeAll(@CurrentUser() user: User) {
    return this.notificationsService.deleteAll(user.id);
  }

  @Post('send-push')
  @ApiOperation({ summary: 'Send push notification' })
  async sendPush(
    @Body('userId') userId: string,
    @Body('title') title: string,
    @Body('body') body: string,
    @Body('data') data: any,
  ) {
    return this.notificationsService.sendPushNotification(userId, title, body, data);
  }

  @Post('send-bulk')
  @ApiOperation({ summary: 'Send bulk notifications' })
  async sendBulk(
    @Body('userIds') userIds: string[],
    @Body('title') title: string,
    @Body('body') body: string,
    @Body('data') data: any,
  ) {
    return this.notificationsService.sendBulkNotifications(userIds, title, body, data);
  }
}