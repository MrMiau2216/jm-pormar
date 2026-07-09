import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { apiUrl } from '../../core/utils/api-url';
import { ApiResponse, PageResponse } from '../models/api.models';
import { Certificacion, CertificacionRequest } from '../models/domain.models';

@Injectable({ providedIn: 'root' })
export class CertificationService {
  constructor(private readonly http: HttpClient) {}

  getPublic(): Observable<Certificacion[]> {
    return this.http.get<ApiResponse<Certificacion[]>>(apiUrl('/api/public/certificaciones'))
      .pipe(map(response => response.data));
  }

  getAdmin(buscar = '', activo?: boolean, page = 0, size = 50): Observable<PageResponse<Certificacion>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (buscar.trim()) params = params.set('buscar', buscar.trim());
    if (activo !== undefined) params = params.set('activo', activo);
    return this.http.get<ApiResponse<PageResponse<Certificacion>>>(apiUrl('/api/admin/certificaciones'), { params })
      .pipe(map(response => response.data));
  }

  create(request: CertificacionRequest): Observable<Certificacion> {
    return this.http.post<ApiResponse<Certificacion>>(apiUrl('/api/admin/certificaciones'), request)
      .pipe(map(response => response.data));
  }

  update(id: string, request: CertificacionRequest): Observable<Certificacion> {
    return this.http.put<ApiResponse<Certificacion>>(apiUrl(`/api/admin/certificaciones/${id}`), request)
      .pipe(map(response => response.data));
  }

  changeStatus(id: string, activo: boolean): Observable<Certificacion> {
    return this.http.patch<ApiResponse<Certificacion>>(apiUrl(`/api/admin/certificaciones/${id}/estado`), { activo })
      .pipe(map(response => response.data));
  }

  viewUrl(id: string): string {
    return `${apiUrl(`/api/public/certificaciones/${id}/ver`)}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;
  }
}
