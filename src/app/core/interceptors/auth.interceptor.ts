import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token;
  const isAdminRequest = req.url.includes('/api/admin/') || req.url.endsWith('/api/auth/me');

  const request = token && isAdminRequest
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(catchError(error => {
    if (error.status === 401 && isAdminRequest) {
      auth.logout();
      void router.navigate(['/portal-jmp/login']);
    }
    return throwError(() => error);
  }));
};
