import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationPriority } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UsersService } from '../users/users.service';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private usersService: UsersService,
  ) {
    // Initialize Firebase Admin
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
  }

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(createNotificationDto);
    return this.notificationRepository.save(notification);
  }

  async findAll(
    userId: string,
    params: { page: number; limit: number; type?: string; isRead?: boolean }
  ): Promise<{ data: Notification[]; total: number }> {
    const { page, limit, type, isRead } = params;
    const queryBuilder = this.notificationRepository.createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId });

    if (type) {
      queryBuilder.andWhere('notification.type = :type', { type });
    }

    if (isRead !== undefined) {
      queryBuilder.andWhere('notification.isRead = :isRead', { isRead });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('notification.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findById(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.findById(id);
    notification.isRead = true;
    notification.readAt = new Date();
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<{ success: boolean }> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
    return { success: true };
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const notification = await this.findById(id);
    await this.notificationRepository.delete(id);
    return { success: true };
  }

  async deleteAll(userId: string): Promise<{ success: boolean }> {
    await this.notificationRepository.delete({ userId });
    return { success: true };
  }

  // Notification Creation Helpers
  async sendBookingCreated(booking: any): Promise<void> {
    await this.create({
      userId: booking.farmerId,
      title: 'Booking Created',
      body: `Your booking #${booking.id.slice(0, 8)} has been created`,
      type: NotificationType.BOOKING,
      priority: NotificationPriority.HIGH,
      data: { bookingId: booking.id },
    });
  }

  async sendBookingStatusUpdate(booking: any): Promise<void> {
    await this.create({
      userId: booking.farmerId,
      title: 'Booking Status Updated',
      body: `Your booking is now ${booking.status}`,
      type: NotificationType.BOOKING,
      priority: NotificationPriority.MEDIUM,
      data: { bookingId: booking.id, status: booking.status },
    });
  }

  async sendBookingRequest(professionalId: string, booking: any): Promise<void> {
    await this.create({
      userId: professionalId,
      title: 'New Service Request',
      body: `You have a new booking request from a farmer`,
      type: NotificationType.BOOKING,
      priority: NotificationPriority.HIGH,
      data: { bookingId: booking.id },
    });
  }

  async sendBookingCancelled(booking: any): Promise<void> {
    await this.create({
      userId: booking.farmerId,
      title: 'Booking Cancelled',
      body: `Your booking has been cancelled`,
      type: NotificationType.BOOKING,
      priority: NotificationPriority.MEDIUM,
      data: { bookingId: booking.id },
    });
  }

  async sendPaymentNotification(userId: string, payment: any): Promise<void> {
    await this.create({
      userId,
      title: 'Payment Update',
      body: `Payment of KES ${payment.amount} has been processed`,
      type: NotificationType.PAYMENT,
      priority: NotificationPriority.HIGH,
      data: { paymentId: payment.id },
    });
  }

  async sendMessageNotification(userId: string, message: any): Promise<void> {
    await this.create({
      userId,
      title: 'New Message',
      body: `You have a new message from ${message.senderName}`,
      type: NotificationType.MESSAGE,
      priority: NotificationPriority.HIGH,
      data: { messageId: message.id, chatId: message.chatId },
    });
  }

  async sendWeatherAlert(userId: string, alert: any): Promise<void> {
    await this.create({
      userId,
      title: 'Weather Alert',
      body: alert.message,
      type: NotificationType.WEATHER,
      priority: NotificationPriority.HIGH,
      data: alert,
    });
  }

  async sendDiseaseAlert(userId: string, alert: any): Promise<void> {
    await this.create({
      userId,
      title: 'Disease Alert',
      body: alert.message,
      type: NotificationType.DISEASE,
      priority: NotificationPriority.URGENT,
      data: alert,
    });
  }

  async sendPromotionNotification(userId: string, promotion: any): Promise<void> {
    await this.create({
      userId,
      title: promotion.title,
      body: promotion.description,
      type: NotificationType.PROMOTION,
      priority: NotificationPriority.MEDIUM,
      imageUrl: promotion.imageUrl,
      actionUrl: promotion.actionUrl,
      data: promotion,
    });
  }

  // Push Notification Methods
  async sendPushNotification(userId: string, title: string, body: string, data?: any): Promise<void> {
    try {
      // Get user's device tokens
      const user = await this.usersService.findById(userId);
      if (!user.devices || user.devices.length === 0) return;

      const tokens = user.devices.map(d => d.pushToken).filter(t => t);

      if (tokens.length === 0) return;

      const message = {
        notification: { title, body },
        data: data || {},
        tokens,
      };

      await admin.messaging().sendMulticast(message);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  async sendBulkNotifications(
    userIds: string[],
    title: string,
    body: string,
    data?: any,
  ): Promise<void> {
    try {
      // Create notifications in database
      const notifications = userIds.map(userId => ({
        userId,
        title,
        body,
        type: NotificationType.SYSTEM,
        priority: NotificationPriority.MEDIUM,
        data,
      }));

      await this.notificationRepository.save(notifications);

      // Send push notifications
      const users = await this.usersService.findByIds(userIds);
      const tokens = users
        .flatMap(u => u.devices?.map(d => d.pushToken) || [])
        .filter(t => t);

      if (tokens.length > 0) {
        const message = {
          notification: { title, body },
          data: data || {},
          tokens,
        };

        await admin.messaging().sendMulticast(message);
      }
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
    }
  }
}