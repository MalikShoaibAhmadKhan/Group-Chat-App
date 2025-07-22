import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private apiUrl = 'http://localhost:3000/messages';
  private http = inject(HttpClient);

  getMessageCount() {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }

  updateReactions(messageId: string, reactions: { [emoji: string]: string[] }) {
    return this.http.patch(`http://localhost:3000/messages/${messageId}/reactions`, { reactions });
  }
} 