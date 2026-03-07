import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // ✅ Not logged in → go to login with returnUrl
  if (!auth.isLoggedIn()) {
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }

  // ✅ Logged in but not ADMIN → go home
  if (!auth.isAdmin()) {
    router.navigate(['/']);
    return false;
  }

  // ✅ ADMIN — allow access
  return true;
};
