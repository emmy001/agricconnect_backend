import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WsAuthGuard } from '../../common/guards/ws-auth.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string[]> = new Map();

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: Socket) {
    // Authenticate user from handshake
    const userId = client.handshake.auth.userId;
    if (userId) {
      this.addUserSocket(userId, client.id);
      client.join(`user:${userId}`);
      await this.chatService.updateUserStatus(userId, true);
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.handshake.auth.userId;
    if (userId) {
      this.removeUserSocket(userId, client.id);
      if (!this.getUserSockets(userId).length) {
        await this.chatService.updateUserStatus(userId, false);
      }
    }
  }

  @SubscribeMessage('join-chat')
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    const userId = client.handshake.auth.userId;
    if (!userId) return;

    client.join(`chat:${data.chatId}`);
    
    // Mark messages as read
    await this.chatService.markMessagesAsRead(data.chatId, userId);
    
    // Send chat history
    const history = await this.chatService.getChatHistory(data.chatId);
    client.emit('chat-history', history);
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; content: string; type?: string },
  ) {
    const userId = client.handshake.auth.userId;
    if (!userId) return;

    const message = await this.chatService.sendMessage({
      chatId: data.chatId,
      senderId: userId,
      content: data.content,
      type: data.type || 'text',
    });

    // Emit to all users in chat room
    this.server.to(`chat:${data.chatId}`).emit('new-message', message);

    // Send notification to recipient
    const chat = await this.chatService.getChatRoom(data.chatId);
    const recipientId = chat.farmerId === userId ? chat.professionalId : chat.farmerId;
    this.server.to(`user:${recipientId}`).emit('new-message-notification', {
      chatId: data.chatId,
      message,
    });
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; isTyping: boolean },
  ) {
    const userId = client.handshake.auth.userId;
    if (!userId) return;

    client.to(`chat:${data.chatId}`).emit('user-typing', {
      userId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('read-receipt')
  async handleReadReceipt(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; messageId: string },
  ) {
    const userId = client.handshake.auth.userId;
    if (!userId) return;

    await this.chatService.markMessageAsRead(data.messageId, userId);
    this.server.to(`chat:${data.chatId}`).emit('message-read', {
      messageId: data.messageId,
      userId,
    });
  }

  private addUserSocket(userId: string, socketId: string) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, []);
    }
    this.userSockets.get(userId).push(socketId);
  }

  private removeUserSocket(userId: string, socketId: string) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      const index = sockets.indexOf(socketId);
      if (index > -1) {
        sockets.splice(index, 1);
      }
      if (sockets.length === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  private getUserSockets(userId: string): string[] {
    return this.userSockets.get(userId) || [];
  }
}