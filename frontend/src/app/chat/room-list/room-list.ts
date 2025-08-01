import { Component, EventEmitter, Output, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { RoomService, Room } from '../../services/room.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../services/api-config';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-list.html',
  styleUrls: ['./room-list.css'],
})
export class RoomListComponent implements OnInit {
  rooms: Room[] = [];
  newRoom = '';
  renamingRoom: Room | null = null;
  renameValue = '';
  hoveredRename: string | null = null;
  hoveredDelete: string | null = null;
  unreadCounts: { [roomId: string]: number } = {};
  isPrivate = false;
  roomCode = '';
  createdRoomCode = '';
  joinRoomCode = '';
  joinRoomError = '';
  currentUserId = '';

  @Output() roomSelected = new EventEmitter<Room>();

  roomService = inject(RoomService);
  http = inject(HttpClient);
  platformId = inject(PLATFORM_ID);

  ngOnInit() {
    // Get current user ID from JWT
    let token = null;
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('access_token');
    }
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserId = payload.userId || payload.sub || '';
      } catch {
        // Ignore token parsing errors
      }
    }
    this.roomService.getRooms().subscribe((data) => {
      this.rooms = data;
      this.rooms.forEach(room => this.fetchUnreadCount(room));
    });
  }

  fetchUnreadCount(room: Room) {
    this.http.get<{ _id: string; createdAt: string; }[]>(`${API_BASE_URL}/messages/${room._id}/meta`).subscribe(
      (messages) => {
        let lastRead = null;
        if (isPlatformBrowser(this.platformId)) {
          lastRead = localStorage.getItem('lastRead_' + room._id);
        }
        let unread = 0;
        if (lastRead) {
          unread = messages.filter(m => new Date(m.createdAt) > new Date(lastRead)).length;
        } else {
          unread = messages.length;
        }
        this.unreadCounts[room._id] = unread;
      },
      () => {
        this.unreadCounts[room._id] = 0;
      }
    );
  }

  markRoomAsRead(room: Room) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lastRead_' + room._id, new Date().toISOString());
    }
    this.unreadCounts[room._id] = 0;
  }

  selectRoom(room: Room) {
    this.joinRoomError = '';
    if (room.isPrivate) {
      const code = prompt('Enter room code to join this private room:');
      if (!code) return;
      if (room.roomCode !== code) {
        this.joinRoomError = 'Incorrect room code.';
        alert('Incorrect room code.');
        return;
      }
    }
    // Open the room in a new tab with the correct route
    window.open(`/chat/${room._id}`, '_blank');
  }

  createRoom() {
    if (!this.newRoom.trim()) return;
    this.roomService.createRoom(this.newRoom, this.isPrivate, this.isPrivate ? this.roomCode : undefined).subscribe((room) => {
      this.rooms.push(room);
      this.newRoom = '';
      this.roomCode = '';
      if (room.isPrivate && room.roomCode) {
        this.createdRoomCode = room.roomCode;
      } else {
        this.createdRoomCode = '';
      }
    });
  }

  openRoomInNewTab(room: Room) {
    window.open(`/chat/${room._id}`, '_blank');
  }

  startRenaming(room: Room) {
    this.renamingRoom = room;
    this.renameValue = room.name;
  }

  confirmRename(room: Room) {
    if (!this.renameValue.trim()) return;
    this.roomService.renameRoom(room._id, this.renameValue).subscribe((updated) => {
      room.name = updated.name;
      this.renamingRoom = null;
      this.renameValue = '';
    });
  }

  cancelRename() {
    this.renamingRoom = null;
    this.renameValue = '';
  }

  deleteRoom(room: Room) {
    if (!confirm('Are you sure you want to delete this room?')) return;
    this.roomService.deleteRoom(room._id).subscribe(() => {
      this.rooms = this.rooms.filter(r => r._id !== room._id);
      if (this.renamingRoom && this.renamingRoom._id === room._id) {
        this.cancelRename();
      }
    });
  }
} 