import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { ChatMessage, MessageType } from './entities/chat-message.entity';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom)
    private chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  async getUserChatRooms(userId: string): Promise<ChatRoom[]> {
    return this.chatRoomRepository.createQueryBuilder('room')
      .leftJoinAndSelect('room.farmer', 'farmer')
      .leftJoinAndSelect('room.professional', 'professional')
      .where('room.farmerId = :userId', { userId })
      .orWhere('room.professionalId = :userId', { userId })
      .andWhere('room.isActive = true')
      .orderBy('room.lastMessageAt', 'DESC')
      .getMany();
  }

  async createChatRoom(farmerId: string, professionalId: string): Promise<ChatRoom> {
    // Check if room already exists
    const existing = await this.chatRoomRepository.findOne({
      where: {
        farmerId,
        professionalId,
        isActive: true,
      },
    });

    if (existing) {
      return existing;
    }

    const room = this.chatRoomRepository.create({
      farmerId,
      professionalId,
      isActive: true,
    });

    return this.chatRoomRepository.save(room);
  }

  async getChatRoom(id: string): Promise<ChatRoom> {
    const room = await this.chatRoomRepository.findOne({
      where: { id, isActive: true },
      relations: ['farmer', 'professional'],
    });
    if (!room) {
      throw new NotFoundException('Chat room not found');
    }
    return room;
  }

  async getChatMessages(chatId: string, page: number = 1, limit: number = 50): Promise<{ data: ChatMessage[]; total: number }> {
    const [data, total] = await this.chatMessageRepository.findAndCount({
      where: { chatRoomId: chatId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data: data.reverse(), total };
  }

  async sendMessage(data: {
    chatId: string;
    senderId: string;
    content: string;
    type?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: string;
  }): Promise<ChatMessage> {
    const room = await this.getChatRoom(data.chatId);

    const message = this.chatMessageRepository.create({
      chatRoomId: data.chatId,
      senderId: data.senderId,
      content: data.content,
      type: data.type as MessageType || MessageType.TEXT,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
    });

    const saved = await this.chatMessageRepository.save(message);

    // Update room last message
    room.lastMessage = data.content;
    room.lastMessageAt = new Date();
    await this.chatRoomRepository.save(room);

    // Send notification to recipient
    const recipientId = room.farmerId === data.senderId ? room.professionalId : room.farmerId;
    await this.notificationsService.sendMessageNotification(recipientId, {
      id: saved.id,
      chatId: data.chatId,
      senderName: 'User',
      content: data.content,
    });

    return saved;
  }

  async markMessagesAsRead(chatId: string, userId: string): Promise<{ success: boolean }> {
    await this.chatMessageRepository.update(
      {
        chatRoomId: chatId,
        isRead: false,
      },
      { isRead: true },
    );
    return { success: true };
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<{ success: boolean }> {
    const message = await this.chatMessageRepository.findOne({
      where: { id: messageId },
      relations: ['room'],
    });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    message.isRead = true;
    await this.chatMessageRepository.save(message);
    return { success: true };
  }

  async getChatHistory(chatId: string): Promise<ChatMessage[]> {
    return this.chatMessageRepository.find({
      where: { chatRoomId: chatId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
      take: 100,
    });
  }

  async updateUserStatus(userId: string, isOnline: boolean): Promise<void> {
    // Update user status in Redis
  }

  async checkOnlineStatus(userId: string): Promise<{ isOnline: boolean }> {
    // Check user status from Redis
    return { isOnline: false };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const rooms = await this.getUserChatRooms(userId);
    const roomIds = rooms.map(r => r.id);

    if (roomIds.length === 0) {
      return { count: 0 };
    }

    const count = await this.chatMessageRepository.count({
      where: {
        chatRoomId: In(roomIds),
        isRead: false,
      },
    });

    return { count };
  }

  async sendTypingIndicator(chatId: string, userId: string, isTyping: boolean): Promise<{ success: boolean }> {
    // Send typing indicator via WebSocket
    return { success: true };
  }
}