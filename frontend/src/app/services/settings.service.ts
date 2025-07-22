import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private platformId = inject(PLATFORM_ID);
  private theme$ = new BehaviorSubject<Theme>(this.getSavedTheme());
  private textSize$ = new BehaviorSubject<'small' | 'medium' | 'large'>(this.getSavedTextSize());
  private textStyle$ = new BehaviorSubject<'sans' | 'serif' | 'mono'>(this.getSavedTextStyle());

  get theme() { return this.theme$.value; }
  get textSize() { return this.textSize$.value; }
  get textStyle() { return this.textStyle$.value; }

  themeChanges() { return this.theme$.asObservable(); }
  textSizeChanges() { return this.textSize$.asObservable(); }
  textStyleChanges() { return this.textStyle$.asObservable(); }

  setTheme(theme: Theme) {
    this.theme$.next(theme);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', theme);
    }
  }
  setTextSize(size: 'small' | 'medium' | 'large') {
    this.textSize$.next(size);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('textSize', size);
    }
  }
  setTextStyle(style: 'sans' | 'serif' | 'mono') {
    this.textStyle$.next(style);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('textStyle', style);
    }
  }

  private getSavedTheme(): Theme {
    if (isPlatformBrowser(this.platformId)) {
      const t = localStorage.getItem('theme');
      if (t === 'light') return 'light';
    }
    return 'dark';
  }
  private getSavedTextSize(): 'small' | 'medium' | 'large' {
    if (isPlatformBrowser(this.platformId)) {
      const s = localStorage.getItem('textSize');
      if (s === 'small' || s === 'medium' || s === 'large') return s;
    }
    return 'medium';
  }
  private getSavedTextStyle(): 'sans' | 'serif' | 'mono' {
    if (isPlatformBrowser(this.platformId)) {
      const s = localStorage.getItem('textStyle');
      if (s === 'sans' || s === 'serif' || s === 'mono') return s;
    }
    return 'sans';
  }
} 