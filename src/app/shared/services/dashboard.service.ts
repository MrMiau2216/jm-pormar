import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { apiUrl } from '../../core/utils/api-url';
import { ApiResponse } from '../models/api.models';
import { Dashboard } from '../models/domain.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private readonly http: HttpClient) {}
  get(): Observable<Dashboard> {
    return this.http.get<ApiResponse<Dashboard>>(apiUrl('/api/admin/dashboard'))
      .pipe(map(response => response.data));
  }
}
