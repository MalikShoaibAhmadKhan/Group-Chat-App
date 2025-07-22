import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';

export interface Room {
  _id: string;
  name: string;
  users: string[];
}

@Injectable({ providedIn: 'root' })
export class RoomService {
  private apiUrl = 'http://localhost:3000/rooms';
  private http = inject(HttpClient);

  getRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(this.apiUrl);
  }

  createRoom(name: string): Observable<Room> {
    return this.http.post<Room>(this.apiUrl, { name });
  }

  renameRoom(roomId: string, newName: string): Observable<Room> {
    return this.http.patch<Room>(`${this.apiUrl}/${roomId}`, { name: newName });
  }

  deleteRoom(roomId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${roomId}`);
  }

  getRoomCount() {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }
} 