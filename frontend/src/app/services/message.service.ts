import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from './api-config';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private apiUrl = API_BASE_URL + '/messages';
  private http = inject(HttpClient);

  getMessageCount() {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }

  updateReactions(messageId: string, reactions: { [emoji: string]: string[] }) {
    return this.http.patch(`${this.apiUrl}/${messageId}/reactions`, { reactions });
  }
} 