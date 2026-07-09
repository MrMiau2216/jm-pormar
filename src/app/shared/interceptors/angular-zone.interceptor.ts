import { HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { inject, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

export const angularZoneInterceptor: HttpInterceptorFn = (request, next) => {
  const ngZone = inject(NgZone);

  return new Observable<HttpEvent<unknown>>(observer => {
    const subscription = next(request).subscribe({
      next: event => ngZone.run(() => observer.next(event)),
      error: error => ngZone.run(() => observer.error(error)),
      complete: () => ngZone.run(() => observer.complete())
    });

    return () => subscription.unsubscribe();
  });
};
