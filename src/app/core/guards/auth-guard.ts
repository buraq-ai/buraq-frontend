import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('isLoggedIn:', authService.isLoggedIn());
  console.log('accessToken:', authService.getAccessToken());

  if (authService.isLoggedIn()) {
    return true;  // ✅ user is logged in — allow access
  }

  router.navigate(['/login']);  // ❌ not logged in — redirect to login
  return false;
};