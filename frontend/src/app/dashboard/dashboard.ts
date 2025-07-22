import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SettingsService } from '../services/settings.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent {
  showSettings = false;
  settings = inject(SettingsService);
  public userService = inject(UserService);
  pendingTheme: 'light' | 'dark' = this.settings.theme === 'light' ? 'light' : 'dark';
  pendingTextSize = this.settings.textSize;
  pendingTextStyle = this.settings.textStyle;

  setTheme(theme: 'light' | 'dark') {
    this.pendingTheme = theme;
  }
  setTextSize(size: string) {
    if (['small', 'medium', 'large'].includes(size)) {
      this.pendingTextSize = size as any;
    }
  }
  setTextStyle(style: string) {
    if (['sans', 'serif', 'mono'].includes(style)) {
      this.pendingTextStyle = style as any;
    }
  }
  applySettings() {
    this.settings.setTheme(this.pendingTheme);
    this.settings.setTextSize(this.pendingTextSize);
    this.settings.setTextStyle(this.pendingTextStyle);
  }
} 