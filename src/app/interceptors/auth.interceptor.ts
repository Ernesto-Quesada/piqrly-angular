import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  console.log('🔒 INTERCEPTOR RUNNING', {
    url: req.url,
    hasToken: !!token,
  });

  // ✅ Skip attaching token for Firebase auth endpoint
  if (!token || req.url.includes('/api/auth/login')) {
    return next(req);
  }

  // ✅ Clone the request and attach the backend JWT
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log('✅ TOKEN ATTACHED to', req.url);

  return next(authReq);
};
