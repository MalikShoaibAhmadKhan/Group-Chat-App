import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { MessagesService } from './messages.service';

@WebSocketGateway({ 
  cors: true,
  transports: ['websocket', 'polling']
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  server: Server;
  private userSockets = new Map<string, Set<string>>(); // userId -> set of socketIds

  constructor(private readonly messagesService: MessagesService) {}

  afterInit(server: Server) {
    this.server = server;
    console.log('WebSocket Gateway initialized');
  }

  async handleConnection(socket: Socket) {
    console.log('Client connected:', socket.id);
    // JWT validation (replace 'your_jwt_secret' with your actual secret)
    const token = socket.handshake.query.token as string;
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        (socket as any).user = payload;
        const userId = String(payload.sub);
        socket.data.userId = userId;
        if (!this.userSockets.has(userId)) {
          this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId)!.add(socket.id);
        if (this.userSockets.get(userId)!.size === 1) {
          // First connection for this user
          this.server.emit('userOnline', { userId });
        }
        console.log('Authenticated user connected:', userId);
      } catch {
        // Invalid token, but don't disconnect immediately
        console.log('Invalid token provided');
      }
    } else {
      // No token provided, allow connection but mark as unauthenticated
      console.log('No token provided');
    }
  }

  handleDisconnect(socket: Socket) {
    console.log('Client disconnected:', socket.id);
    const userId = socket.data.userId;
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(socket.id);
      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId);
        this.server.emit('userOffline', { userId });
      }
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() roomId: string, @ConnectedSocket() socket: Socket) {
    socket.join(roomId);
    const userId = socket.data.userId;
    this.server.to(roomId).emit('userJoined', { user: { ...((socket as any).user), senderId: userId }, userId, roomId });
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@MessageBody() roomId: string, @ConnectedSocket() socket: Socket) {
    socket.leave(roomId);
    const userId = socket.data.userId;
    this.server.to(roomId).emit('userLeft', { user: { ...((socket as any).user), senderId: userId }, userId, roomId });
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() data: any, @ConnectedSocket() socket: Socket) {
    // data: { roomId, content, ... }
    const userId = socket.data.userId;
    if (!userId) {
      socket.emit('error', { message: 'Authentication required' });
      return;
    }
    // Save to DB
    const savedMsg = await this.messagesService.sendMessage(
      (socket as any).user.username,
      data.content,
      data.roomId,
      userId
    );
    // Broadcast the saved message (with _id, timestamps, etc.)
    this.server.to(data.roomId).emit('newMessage', savedMsg);
  }

  @SubscribeMessage('userTyping')
  handleUserTyping(@MessageBody() roomId: string, @ConnectedSocket() socket: Socket) {
    const userId = socket.data.userId;
    this.server.to(roomId).emit('typing', { user: { ...((socket as any).user), senderId: userId }, userId, roomId });
  }
} 