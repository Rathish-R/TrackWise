import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const isAuthenticated = !!localStorage.getItem('trackwise_token');
  return isAuthenticated ? true : router.createUrlTree(['/login']);
};
