import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';

export interface UserProfile {
  _id: string;
  username: string;
  photo?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private auth = inject(AuthService);
  private user$ = new BehaviorSubject<UserProfile | null>(null);
  private userCache = new Map<string, UserProfile>();
  private userCache$ = new BehaviorSubject<{ [id: string]: UserProfile }>({});
  private userSubjects: { [id: string]: BehaviorSubject<UserProfile | undefined> } = {};

  get user() { return this.user$.value; }
  userChanges() { return this.user$.asObservable(); }

  fetchProfile() {
    return this.http.get<UserProfile>('http://localhost:3000/auth/profile').subscribe(profile => {
      this.user$.next(profile);
    });
  }

  updateProfile(formData: FormData) {
    return this.http.patch<{ profile: UserProfile; access_token: string }>('http://localhost:3000/auth/profile', formData).subscribe(res => {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('access_token', res.access_token);
      }
      this.auth.setToken(res.access_token);
      this.user$.next(res.profile);
    });
  }

  clear() {
    this.user$.next(null);
  }

  getUserById(id: string) {
    if (!this.userSubjects[id]) {
      this.userSubjects[id] = new BehaviorSubject<UserProfile | undefined>(undefined);
      this.http.get<UserProfile>(`http://localhost:3000/auth/user/${id}`).subscribe(profile => {
        this.userCache.set(id, profile);
        this.userSubjects[id].next(profile);
      });
    }
    return this.userSubjects[id].asObservable();
  }
} 