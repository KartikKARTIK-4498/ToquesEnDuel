import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check both Firebase auth and localStorage
  if (authService.currentUser || localStorage.getItem('authenticated') === 'true') {
    return true;
  }

  // If no auth, redirect to login
  return router.parseUrl('/auth/login');
};
