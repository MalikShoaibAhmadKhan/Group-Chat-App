import { PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { API_BASE_URL } from './api-config';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = API_BASE_URL + '/auth';
  private tokenKey = 'access_token';
  private platformId = inject(PLATFORM_ID);
  private isLoggedIn$ = new BehaviorSubject<boolean>(this.hasToken());
  private http = inject(HttpClient);

  private hasToken(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem(this.tokenKey);
    }
    return false;
  }

  login(username: string, password: string) {
    return this.http
      .post<{ access_token: string }>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap((res) => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.tokenKey, res.access_token);
          }
          this.isLoggedIn$.next(true);
        })
      );
  }

  register(username: string, password: string) {
    return this.http.post(`${this.apiUrl}/register`, { username, password });
  }

  logout() {
    // Call backend logout endpoint
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem(this.tokenKey);
        }
        this.isLoggedIn$.next(false);
      },
      error: () => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem(this.tokenKey);
        }
        this.isLoggedIn$.next(false);
      }
    });
  }

  getToken() {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  setToken(token: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, token);
    }
    this.isLoggedIn$.next(true);
  }

  isAuthenticated$() {
    return this.isLoggedIn$.asObservable();
  }

  getUserCount() {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }

  getOnlineUserCount() {
    return this.http.get<number>(`${this.apiUrl}/online-count`);
  }
}