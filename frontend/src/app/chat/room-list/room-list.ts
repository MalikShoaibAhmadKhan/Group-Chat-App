import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomService, Room } from '../../services/room.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-list.html',
  styleUrls: ['./room-list.css'],
})
export class RoomListComponent {
  rooms: Room[] = [];
  newRoom = '';
  renamingRoom: Room | null = null;
  renameValue = '';
  hoveredRename: string | null = null;
  hoveredDelete: string | null = null;
  unreadCounts: { [roomId: string]: number } = {};

  @Output() roomSelected = new EventEmitter<Room>();

  roomService = inject(RoomService);
  http = inject(HttpClient);

  ngOnInit() {
    this.roomService.getRooms().subscribe((data) => {
      this.rooms = data;
      this.rooms.forEach(room => this.fetchUnreadCount(room));
    });
  }

  fetchUnreadCount(room: Room) {
    this.http.get<{ _id: string; createdAt: string; }[]>(`http://localhost:3000/messages/${room._id}/meta`).subscribe(
      (messages) => {
        const lastRead = localStorage.getItem('lastRead_' + room._id);
        let unread = 0;
        if (lastRead) {
          unread = messages.filter(m => new Date(m.createdAt) > new Date(lastRead)).length;
        } else {
          unread = messages.length;
        }
        this.unreadCounts[room._id] = unread;
      },
      err => {
        this.unreadCounts[room._id] = 0;
      }
    );
  }

  markRoomAsRead(room: Room) {
    localStorage.setItem('lastRead_' + room._id, new Date().toISOString());
    this.unreadCounts[room._id] = 0;
  }

  selectRoom(room: Room) {
    this.markRoomAsRead(room);
    this.roomSelected.emit(room);
  }

  createRoom() {
    if (!this.newRoom.trim()) return;
    this.roomService.createRoom(this.newRoom).subscribe((room) => {
      this.rooms.push(room);
      this.newRoom = '';
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