import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { apiUrl } from '../../core/utils/api-url';
import { ApiResponse, PageResponse } from '../models/api.models';
import { Categoria } from '../models/domain.models';

export interface CategoriaRequest {
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private readonly http: HttpClient) {}

  getPublic(): Observable<Categoria[]> {
    return this.http.get<ApiResponse<Categoria[]>>(apiUrl('/api/public/categorias'))
      .pipe(map(response => response.data));
  }

  getAdmin(buscar = '', page = 0, size = 50): Observable<PageResponse<Categoria>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (buscar.trim()) params = params.set('buscar', buscar.trim());
    return this.http.get<ApiResponse<PageResponse<Categoria>>>(apiUrl('/api/admin/categorias'), { params })
      .pipe(map(response => response.data));
  }

  create(request: CategoriaRequest): Observable<Categoria> {
    return this.http.post<ApiResponse<Categoria>>(apiUrl('/api/admin/categorias'), request)
      .pipe(map(response => response.data));
  }

  update(id: string, request: CategoriaRequest): Observable<Categoria> {
    return this.http.put<ApiResponse<Categoria>>(apiUrl(`/api/admin/categorias/${id}`), request)
      .pipe(map(response => response.data));
  }

  changeStatus(id: string, activo: boolean): Observable<Categoria> {
    return this.http.patch<ApiResponse<Categoria>>(apiUrl(`/api/admin/categorias/${id}/estado`), { activo })
      .pipe(map(response => response.data));
  }
}
