import { Route } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { authGuard } from './guards/auth.guard';
import { RoomChatComponent } from './chat/room-chat/room-chat';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'chat',
    loadComponent: () => import('./chat/chat.component').then(m => m.ChatComponent),
    canActivate: [authGuard],
  },
  {
    path: 'chat/:roomId',
    component: RoomChatComponent,
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard/dashboard-stats').then(m => m.DashboardStatsComponent),
        canActivate: [authGuard],
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile').then(m => m.ProfileComponent),
        canActivate: [authGuard],
      },
    ],
  },
];
