import { Component, inject, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SettingsService } from './services/settings.service';

@Component({
  imports: [RouterModule, CommonModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'frontend';
  platformId = inject(PLATFORM_ID);
  settings = inject(SettingsService);

  get theme() { return this.settings.theme; }
  get textSize() { return this.settings.textSize; }
  get textStyle() { return this.settings.textStyle; }

  constructor() {
    this.settings.themeChanges().subscribe(theme => this.applyTheme(theme));
    this.settings.textSizeChanges().subscribe(size => this.applyTextSize(size));
    this.settings.textStyleChanges().subscribe(style => this.applyTextStyle(style));
    // Initial apply
    this.applyTheme(this.theme);
    this.applyTextSize(this.textSize);
    this.applyTextStyle(this.textStyle);
  }

  setTheme(theme: 'dark' | 'light') {
    this.settings.setTheme(theme);
  }
  setTextSize(size: 'small' | 'medium' | 'large') {
    this.settings.setTextSize(size);
  }
  setTextStyle(style: 'sans' | 'serif' | 'mono') {
    this.settings.setTextStyle(style);
  }

  applyTheme(theme: string) {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('theme-dark', 'theme-light');
      document.body.classList.add('theme-' + (theme === 'light' ? 'light' : 'dark'));
      console.log('Theme applied:', theme, document.body.className);
    }
  }
  applyTextSize(size: string) {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('text-small', 'text-medium', 'text-large');
      document.body.classList.add('text-' + size);
    }
  }
  applyTextStyle(style: string) {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('font-sans', 'font-serif', 'font-mono');
      document.body.classList.add('font-' + style);
    }
  }
}
