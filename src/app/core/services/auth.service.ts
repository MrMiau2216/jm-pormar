import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { apiUrl } from '../utils/api-url';
import { ApiResponse } from '../../shared/models/api.models';
import { AdminSession, LoginRequest, LoginResponse } from '../../shared/models/domain.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'jm_pormar_admin_token';
  private readonly sessionKey = 'jm_pormar_admin_session';

  constructor(private readonly http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<ApiResponse<LoginResponse>>(apiUrl('/api/auth/login'), request).pipe(
      map(response => response.data),
      tap(response => {
        localStorage.setItem(this.tokenKey, response.accessToken);
        localStorage.setItem(this.sessionKey, JSON.stringify(response));
      })
    );
  }

  me(): Observable<AdminSession> {
    return this.http.get<ApiResponse<AdminSession>>(apiUrl('/api/auth/me'))
      .pipe(map(response => response.data));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.sessionKey);
  }

  get token(): string | null { return localStorage.getItem(this.tokenKey); }
  get isAuthenticated(): boolean { return Boolean(this.token); }

  get session(): LoginResponse | null {
    try {
      const value = localStorage.getItem(this.sessionKey);
      return value ? JSON.parse(value) as LoginResponse : null;
    } catch {
      return null;
    }
  }
}
