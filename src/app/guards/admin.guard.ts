import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const AdminGuard: CanActivateFn = (route, state) => {

  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAdmin()) {
    // Si no es admin, lo devolvemos al Home
    router.navigate(['/home']);
    return false;
  }

  return true;
};