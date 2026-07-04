import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { apiUrl } from '../../core/utils/api-url';
import { ApiResponse, PageResponse } from '../models/api.models';
import { Servicio, ServicioRequest } from '../models/domain.models';

@Injectable({ providedIn: 'root' })
export class ServiceService {
  constructor(private readonly http: HttpClient) {}

  getPublic(): Observable<Servicio[]> {
    return this.http.get<ApiResponse<Servicio[]>>(apiUrl('/api/public/servicios'))
      .pipe(map(response => response.data));
  }

  getAdmin(buscar = '', activo?: boolean, page = 0, size = 50): Observable<PageResponse<Servicio>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (buscar.trim()) params = params.set('buscar', buscar.trim());
    if (activo !== undefined) params = params.set('activo', activo);
    return this.http.get<ApiResponse<PageResponse<Servicio>>>(apiUrl('/api/admin/servicios'), { params })
      .pipe(map(response => response.data));
  }


  getAdminById(id: string): Observable<Servicio> {
    return this.http.get<ApiResponse<Servicio>>(apiUrl(`/api/admin/servicios/${id}`))
      .pipe(map(response => response.data));
  }

  addImage(id: string, urlImagen: string, orden = 1): Observable<void> {
    return this.http.post<ApiResponse<unknown>>(apiUrl(`/api/admin/servicios/${id}/imagenes`), { urlImagen, orden })
      .pipe(map(() => undefined));
  }

  removeImage(id: string, imageId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(apiUrl(`/api/admin/servicios/${id}/imagenes/${imageId}`))
      .pipe(map(() => undefined));
  }

  create(request: ServicioRequest): Observable<Servicio> {
    return this.http.post<ApiResponse<Servicio>>(apiUrl('/api/admin/servicios'), request)
      .pipe(map(response => response.data));
  }

  update(id: string, request: ServicioRequest): Observable<Servicio> {
    return this.http.put<ApiResponse<Servicio>>(apiUrl(`/api/admin/servicios/${id}`), request)
      .pipe(map(response => response.data));
  }

  changeStatus(id: string, activo: boolean): Observable<Servicio> {
    return this.http.patch<ApiResponse<Servicio>>(apiUrl(`/api/admin/servicios/${id}/estado`), { activo })
      .pipe(map(response => response.data));
  }
}
