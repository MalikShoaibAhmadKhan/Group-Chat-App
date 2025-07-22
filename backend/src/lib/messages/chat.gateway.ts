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

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  server: Server;

  afterInit(server: Server) {
    this.server = server;
  }

  async handleConnection(socket: Socket) {
    // JWT validation (replace 'your_jwt_secret' with your actual secret)
    const token = socket.handshake.query.token as string;
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      (socket as any).user = payload;
    } catch {
      socket.disconnect(true);
      return;
    }
  }

  handleDisconnect(socket: Socket) {
    // Optionally broadcast user left
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() roomId: string, @ConnectedSocket() socket: Socket) {
    socket.join(roomId);
    this.server.to(roomId).emit('userJoined', { user: (socket as any).user, roomId });
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@MessageBody() roomId: string, @ConnectedSocket() socket: Socket) {
    socket.leave(roomId);
    this.server.to(roomId).emit('userLeft', { user: (socket as any).user, roomId });
  }

  @SubscribeMessage('sendMessage')
  handleSendMessage(@MessageBody() data: any, @ConnectedSocket() socket: Socket) {
    // data: { roomId, content, ... }
    this.server.to(data.roomId).emit('newMessage', { ...data, user: (socket as any).user });
  }

  @SubscribeMessage('userTyping')
  handleUserTyping(@MessageBody() roomId: string, @ConnectedSocket() socket: Socket) {
    this.server.to(roomId).emit('typing', { user: (socket as any).user, roomId });
  }
} 