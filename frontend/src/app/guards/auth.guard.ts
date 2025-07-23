import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();
  const publicRoutes = ['/login', '/register'];
  if (token) {
    return true;
  } else if (publicRoutes.includes(state.url)) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
}; 