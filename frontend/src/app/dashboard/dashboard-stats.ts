import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { RoomService } from '../services/room.service';
import { MessageService } from '../services/message.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-stats.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardStatsComponent implements OnInit, OnDestroy {
  static instance: DashboardStatsComponent | null = null;
  userCount = 0;
  roomCount = 0;
  activeUsers = 0;
  messageCount = 0;
  private pollInterval: any;

  private auth = inject(AuthService);
  private room = inject(RoomService);
  private message = inject(MessageService);
  private router = inject(Router);

  constructor() {
    DashboardStatsComponent.instance = this;
  }

  ngOnInit() {
    this.auth.getUserCount().subscribe(count => this.userCount = count);
    this.room.getRoomCount().subscribe(count => this.roomCount = count);
    this.auth.getOnlineUserCount().subscribe(count => this.activeUsers = count);
    this.message.getMessageCount().subscribe(count => this.messageCount = count);
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
} 