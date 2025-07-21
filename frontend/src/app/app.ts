import { Component, inject, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
// import { NxWelcome } from './nx-welcome';

@Component({
  imports: [RouterModule, CommonModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'frontend';
  public theme: 'dark' | 'light' = 'dark';
  platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') {
        this.theme = saved;
      }
      this.applyTheme();
    }
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', this.theme);
      this.applyTheme();
    }
  }

  applyTheme() {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('theme-dark', 'theme-light');
      document.body.classList.add('theme-' + this.theme);
    }
  }
}
