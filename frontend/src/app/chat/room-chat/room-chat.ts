import { Component, OnInit, ChangeDetectorRef, inject, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Room, RoomService } from '../../services/room.service';
import { isPlatformBrowser } from '@angular/common';
import { UserService } from '../../services/user.service';
import { MessageService } from '../../services/message.service';
import { SocketService } from '../../services/socket.service';

interface Message {
  _id?: string;
  sender: string;
  content: string;
  room: string;
  edited?: boolean;
  deleted?: boolean;
  reactions?: { [emoji: string]: string[] };
  pinned?: boolean;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
  senderId?: string;
  delivered?: boolean;
}

@Component({
  selector: 'app-room-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-chat.html',
  styleUrls: ['./room-chat.css'],
  encapsulation: ViewEncapsulation.None,
})
export class RoomChatComponent implements OnInit {
  room: Room | null = null;
  messages: Message[] = [];
  newMessage = '';
  currentUser = '';
  editingMessageId: string | null = null;
  editValue = '';
  typingUsers: Set<string> = new Set();
  pinnedMessageIds: Set<string> = new Set();
  reactionEmojis = ['👍', '😂', '❤️', '😮', '😢', '🔥'];
  typingTimeout: any = null;
  selectedFile: File | null = null;
  filePreviewUrl: string | null = null;
  isImageFile = false;
  showReactionsFor: string | null = null;
  lastTap = 0;
  tapTimeout: number | null = null;
  // For floating emoji/context menus
  reactionMenuX = 0;
  reactionMenuY = 0;
  contextMenuFor: string | null = null;
  contextMenuX = 0;
  contextMenuY = 0;
  userProfiles: { [id: string]: { username: string; photo?: string } } = {};
  systemMessages: { text: string; type: 'info' | 'error'; }[] = [];
  reconnecting = false;

  route = inject(ActivatedRoute);
  http = inject(HttpClient);
  roomService = inject(RoomService);
  cd = inject(ChangeDetectorRef);
  platformId = inject(PLATFORM_ID);
  userService = inject(UserService);
  messageService = inject(MessageService);
  socketService = inject(SocketService);

  constructor() {
    // Try to get current user from localStorage (JWT payload)
    let token = null;
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('access_token');
    }
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUser = payload.username;
      } catch {}
    }
    // Subscribe to user changes for live updates
    this.userService.userChanges().subscribe(user => {
      if (user && user.username) {
        this.currentUser = user.username;
      }
    });
  }

  ngOnInit() {
    const roomId = this.route.snapshot.paramMap.get('roomId');
    let token = null;
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('access_token');
    }
    if (token) {
      this.socketService.connect(token);
      // Reconnection handling
      (this.socketService as any).socket?.on('disconnect', () => {
        this.reconnecting = true;
        this.cd.detectChanges();
      });
      (this.socketService as any).socket?.on('connect', () => {
        this.reconnecting = false;
        this.cd.detectChanges();
      });
      (this.socketService as any).socket?.on('reconnect_attempt', () => {
        this.reconnecting = true;
        this.cd.detectChanges();
      });
    }
    if (roomId) {
      this.roomService.getRooms().subscribe((rooms) => {
        const found = rooms.find(r => r._id === roomId);
        if (found) {
          this.room = found;
          this.fetchMessages();
          this.socketService.joinRoom(roomId);
          this.socketService.onNewMessage().subscribe(msg => {
            // Mark as delivered if it's our own message
            if (msg.sender === this.currentUser) {
              msg.delivered = true;
            }
            this.messages.push(msg);
            this.cd.detectChanges();
          });
          this.socketService.onUserJoined().subscribe(data => {
            if (data.user?.username && data.user.username !== this.currentUser) {
              this.systemMessages.push({ text: `${data.user.username} joined the room`, type: 'info' });
              this.cd.detectChanges();
            }
          });
          this.socketService.onUserLeft().subscribe(data => {
            if (data.user?.username && data.user.username !== this.currentUser) {
              this.systemMessages.push({ text: `${data.user.username} left the room`, type: 'info' });
              this.cd.detectChanges();
            }
          });
          this.socketService.onTyping().subscribe(data => {
            if (data.user?.username && data.user.username !== this.currentUser) {
              this.typingUsers.add(data.user.username);
              setTimeout(() => {
                this.typingUsers.delete(data.user.username);
                this.cd.detectChanges();
              }, 2000);
              this.cd.detectChanges();
            }
          });
        }
      });
    }
    document.addEventListener('click', this.hideReactions.bind(this));
    this.userService.userChanges().subscribe(() => this.cd.detectChanges());
  }

  fetchMessages() {
    if (this.room && this.room._id) {
      this.http.get<Message[]>(`http://localhost:3000/messages/${this.room._id}`).subscribe(
        msgs => {
          this.messages = msgs;
          this.cd.detectChanges();
        },
        err => {
          this.messages = [];
        }
      );
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.isImageFile = this.selectedFile.type.startsWith('image/');
      if (this.isImageFile) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.filePreviewUrl = e.target.result;
        };
        reader.readAsDataURL(this.selectedFile);
      } else {
        this.filePreviewUrl = null;
      }
    }
  }
  clearFile() {
    this.selectedFile = null;
    this.filePreviewUrl = null;
    this.isImageFile = false;
  }

  sendMessage() {
    if ((!this.newMessage.trim() && !this.selectedFile) || !this.room) return;
    this.emitTyping(false);
    const sender = this.userService.user?.username || this.currentUser;
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('content', this.newMessage);
      formData.append('roomId', this.room._id!);
      formData.append('file', this.selectedFile);
      this.http.post<Message>('http://localhost:3000/messages/upload', formData).subscribe(
        msg => {
          this.messages.push(msg);
          this.newMessage = '';
          this.clearFile();
        },
        err => {
          alert('Failed to send message with file');
        }
      );
    } else {
      // Emit via socket for real-time
      const msg = {
        content: this.newMessage,
        roomId: this.room._id,
        sender: sender,
        delivered: false
      };
      this.messages.push(msg as any); // Optimistic UI
      this.socketService.sendMessage(msg);
      this.newMessage = '';
    }
  }

  onInputTyping() {
    this.emitTyping(true);
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => this.emitTyping(false), 2000);
  }

  emitTyping(isTyping: boolean) {
    if (isTyping && this.room) {
      this.socketService.userTyping(this.room._id);
    }
    // Placeholder: In real app, use websockets. For now, just local state.
    if (isTyping) {
      this.typingUsers.add(this.currentUser);
    } else {
      this.typingUsers.delete(this.currentUser);
    }
  }

  getAvatarUrl(username: string, senderId?: string): string {
    if ((senderId && senderId === this.userService.user?._id) || (username === this.userService.user?.username && this.userService.user?.photo)) {
      return this.userService.user.photo!;
    }
    if (senderId) {
      this.userService.getUserById(senderId).subscribe(profile => {
        if (profile && profile.photo) {
          this.userProfiles[senderId] = { username: profile.username, photo: profile.photo };
        }
      });
      if (this.userProfiles[senderId]?.photo) {
        return this.userProfiles[senderId].photo!;
      }
    }
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(username)}`;
  }

  getDisplayName(username: string, senderId?: string): string {
    if ((senderId && senderId === this.userService.user?._id) || (username === this.userService.user?.username && this.userService.user?.username)) {
      return this.userService.user.username;
    }
    if (senderId) {
      this.userService.getUserById(senderId).subscribe(profile => {
        if (profile && profile.username) {
          this.userProfiles[senderId] = { username: profile.username, photo: profile.photo };
        }
      });
      if (this.userProfiles[senderId]?.username) {
        return this.userProfiles[senderId].username;
      }
    }
    return username;
  }

  onMessageTap(message: Message, event: Event) {
    event.stopPropagation();
    const now = Date.now();
    if (this.lastTap && now - this.lastTap < 350) {
      // Double tap/click
      this.showReactionsFor = message._id || null;
      // Position emoji bar above message
      const target = event.target as HTMLElement;
      const msgElem = target.closest('.message-item') as HTMLElement;
      if (msgElem) {
        const rect = msgElem.getBoundingClientRect();
        this.reactionMenuX = rect.left + rect.width / 2;
        this.reactionMenuY = rect.top - 8; // 8px above
      }
      if (this.tapTimeout !== null) {
        clearTimeout(this.tapTimeout);
        this.tapTimeout = null;
      }
    } else {
      this.lastTap = now;
      if (this.tapTimeout !== null) clearTimeout(this.tapTimeout);
      this.tapTimeout = window.setTimeout(() => {
        this.lastTap = 0;
      }, 400);
    }
  }
  hideReactions() {
    this.showReactionsFor = null;
  }
  toggleReaction(message: Message, emoji: string) {
    if (!message.reactions) message.reactions = {};
    // Remove user from all other emoji reactions
    for (const e of this.reactionEmojis) {
      if (message.reactions[e]) {
        const idx = message.reactions[e].indexOf(this.currentUser);
        if (idx !== -1) message.reactions[e].splice(idx, 1);
      }
    }
    // Add or remove reaction for the selected emoji
    if (!message.reactions[emoji]) message.reactions[emoji] = [];
    const idx = message.reactions[emoji].indexOf(this.currentUser);
    if (idx === -1) {
      message.reactions[emoji].push(this.currentUser);
    } else {
      message.reactions[emoji].splice(idx, 1);
    }
    // Persist reactions to backend
    if (message._id) {
      this.messageService.updateReactions(message._id, message.reactions).subscribe((updated: any) => {
        message.reactions = updated.reactions;
      });
    }
    this.hideReactions();
  }

  isReacted(message: Message, emoji: string): boolean {
    return !!(message.reactions && message.reactions[emoji]?.includes(this.currentUser));
  }

  togglePin(message: Message) {
    if (!message._id) return;
    if (this.pinnedMessageIds.has(message._id)) {
      this.pinnedMessageIds.delete(message._id);
      message.pinned = false;
    } else {
      this.pinnedMessageIds.add(message._id);
      message.pinned = true;
    }
  }

  isPinned(message: Message): boolean {
    return Boolean(message.pinned) || (message._id ? this.pinnedMessageIds.has(message._id) : false);
  }

  startEdit(msg: Message) {
    this.editingMessageId = msg._id || null;
    this.editValue = msg.content;
  }

  saveEdit(msg: Message) {
    if (!this.editValue.trim() || !msg._id) return;
    this.http.patch<Message>(`http://localhost:3000/messages/${msg._id}`, { content: this.editValue }).subscribe(
      updated => {
        msg.content = updated.content;
        msg.edited = updated.edited;
        this.editingMessageId = null;
        this.editValue = '';
      },
      err => {
        alert('Failed to edit message');
      }
    );
  }

  cancelEdit() {
    this.editingMessageId = null;
    this.editValue = '';
  }

  deleteMessage(msg: Message) {
    if (!msg._id) return;
    if (!confirm('Delete this message?')) return;
    this.http.delete<{ deleted: boolean }>(`http://localhost:3000/messages/${msg._id}`).subscribe(
      res => {
        msg.content = '[deleted]';
        msg.deleted = true;
      },
      err => {
        alert('Failed to delete message');
      }
    );
  }

  onMessageContextMenu(message: Message, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.contextMenuFor = message._id || null;
    // Position context menu above message
    const target = event.target as HTMLElement;
    const msgElem = target.closest('.message-item') as HTMLElement;
    if (msgElem) {
      const rect = msgElem.getBoundingClientRect();
      this.contextMenuX = rect.left + rect.width / 2;
      this.contextMenuY = rect.top - 8;
    } else {
      this.contextMenuX = event.clientX;
      this.contextMenuY = event.clientY;
    }
    document.addEventListener('click', this.closeContextMenu.bind(this), { once: true });
  }
  closeContextMenu() {
    this.contextMenuFor = null;
  }
  onContextMenuPin(message: Message) {
    this.togglePin(message);
    this.closeContextMenu();
  }
  onContextMenuEdit(message: Message) {
    this.startEdit(message);
    this.closeContextMenu();
  }
  onContextMenuDelete(message: Message) {
    this.deleteMessage(message);
    this.closeContextMenu();
  }

  get contextMenuMessage() {
    return this.contextMenuFor ? this.messages.find(m => m._id === this.contextMenuFor) || null : null;
  }

  get reactionMenuMessage() {
    return this.showReactionsFor ? this.messages.find(m => m._id === this.showReactionsFor) || null : null;
  }

  get roomUsers() {
    // Extract unique usernames from messages
    const now = Date.now();
    const users: { username: string; online: boolean; lastActive: number; }[] = [];
    const seen = new Set<string>();
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const msg = this.messages[i];
      if (!seen.has(msg.sender)) {
        seen.add(msg.sender);
        const lastActive = new Date((msg as any).createdAt || Date.now()).getTime();
        users.push({
          username: msg.sender,
          online: now - lastActive < 2 * 60 * 1000, // 2 minutes
          lastActive
        });
      }
    }
    // Sort online first, then by lastActive desc
    return users.sort((a, b) => (b.online ? 1 : 0) - (a.online ? 1 : 0) || b.lastActive - a.lastActive);
  }

  // Helper to check if a message has any reactions
  hasReactions(message: Message): boolean {
    if (!message.reactions) return false;
    return this.reactionEmojis.some(emoji => message.reactions && message.reactions[emoji]?.length > 0);
  }

  getReactedEmojis(message: Message): string[] {
    if (!message.reactions) return [];
    return this.reactionEmojis.filter(emoji => message.reactions && message.reactions[emoji]?.length > 0);
  }

  // Scroll to first unread message (simulate with a local variable for now)
  ngAfterViewInit() {
    setTimeout(() => {
      const messagesList = document.querySelector('.messages-list');
      if (messagesList) {
        // For demo: scroll to the last message (simulate unread)
        messagesList.scrollTop = messagesList.scrollHeight;
      }
    }, 100);
  }

  ngOnDestroy() {
    if (this.room) {
      this.socketService.leaveRoom(this.room._id);
    }
    this.socketService.disconnect();
  }
} 