import { Route } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { authGuard } from './guards/auth.guard';
import { RoomChatComponent } from './chat/room-chat/room-chat';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, data: { title: 'Login - Group Chat App' } },
  { path: 'register', component: RegisterComponent, data: { title: 'Register - Group Chat App' } },
  {
    path: 'chat',
    loadComponent: () => import('./chat/chat.component').then(m => m.ChatComponent),
    canActivate: [authGuard],
    data: { title: 'Chat Rooms - Group Chat App' },
  },
  {
    path: 'chat/:roomId',
    component: RoomChatComponent,
    canActivate: [authGuard],
    data: { title: 'Room Chat - Group Chat App' },
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    data: { title: 'Dashboard - Group Chat App' },
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard/dashboard-stats').then(m => m.DashboardStatsComponent),
        canActivate: [authGuard],
        data: { title: 'Dashboard Stats - Group Chat App' },
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile').then(m => m.ProfileComponent),
        canActivate: [authGuard],
        data: { title: 'Profile - Group Chat App' },
      },
    ],
  },
];
