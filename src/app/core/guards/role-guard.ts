import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const userRole = authService.getUserRole();
  const allowedRoles: string[] = route.data['roles'] ?? [];

  if (userRole && allowedRoles.includes(userRole)) {
    return true;  // ✅ user has the correct role — allow access
  }

  router.navigate(['/unauthorized']);  // ❌ wrong role — redirect
  return false;
};