import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-config';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;
  private readonly url = API_BASE_URL; // Use dynamic config

  connect(token: string) {
    if (this.socket) return;
    this.socket = io(this.url, {
      query: { token },
      transports: ['websocket'],
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  joinRoom(roomId: string) {
    this.socket?.emit('joinRoom', roomId);
  }
  leaveRoom(roomId: string) {
    this.socket?.emit('leaveRoom', roomId);
  }
  sendMessage(data: unknown) {
    this.socket?.emit('sendMessage', data);
  }
  userTyping(roomId: string) {
    this.socket?.emit('userTyping', roomId);
  }

  onNewMessage(): Observable<unknown> {
    return new Observable(observer => {
      this.socket?.on('newMessage', msg => observer.next(msg));
    });
  }
  onUserJoined(): Observable<unknown> {
    return new Observable(observer => {
      this.socket?.on('userJoined', data => observer.next(data));
    });
  }
  onUserLeft(): Observable<unknown> {
    return new Observable(observer => {
      this.socket?.on('userLeft', data => observer.next(data));
    });
  }
  onTyping(): Observable<unknown> {
    return new Observable(observer => {
      this.socket?.on('typing', data => observer.next(data));
    });
  }
  onUserOnline(): Observable<unknown> {
    return new Observable(observer => {
      this.socket?.on('userOnline', data => observer.next(data));
    });
  }
  onUserOffline(): Observable<unknown> {
    return new Observable(observer => {
      this.socket?.on('userOffline', data => observer.next(data));
    });
  }
} 