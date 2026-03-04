import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn) {
    router.navigate(['/auth']);
    return false;
  }
  // If on kyc page, allow through
  const url = router.getCurrentNavigation()?.extractedUrl.toString() || '';
  const user = auth.currentUser;
  if (user && !user.kycVerified && url !== '/kyc' && user.role !== 'admin') {
    router.navigate(['/kyc']);
    return false;
  }
  return true;
};

export const guestGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn) {
    const user = auth.currentUser;
    if (user && !user.kycVerified && user.role !== 'admin') {
      router.navigate(['/kyc']);
    } else {
      router.navigate(['/dashboard']);
    }
    return false;
  }
  return true;
};
