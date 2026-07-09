import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { apiUrl } from '../../core/utils/api-url';
import { ApiResponse, PageResponse } from '../models/api.models';
import { DisponibilidadProducto, Producto, ProductoRequest } from '../models/domain.models';

export interface ProductFilters {
  buscar?: string;
  categoriaId?: string;
  disponibilidad?: DisponibilidadProducto;
  activo?: boolean;
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  [x: string]: any;
  constructor(private readonly http: HttpClient) {}

  getPublicProducts(filters: ProductFilters = {}): Observable<PageResponse<Producto>> {
    return this.http
      .get<ApiResponse<PageResponse<Producto>>>(apiUrl('/api/public/productos'), {
        params: this.toParams(filters)
      })
      .pipe(map(response => response.data));
  }

  getPublicProduct(id: string): Observable<Producto> {
    return this.http
      .get<ApiResponse<Producto>>(apiUrl(`/api/public/productos/${id}`))
      .pipe(map(response => response.data));
  }

  getRelatedProducts(id: string): Observable<Producto[]> {
    return this.http
      .get<ApiResponse<Producto[]>>(apiUrl(`/api/public/productos/${id}/relacionados`))
      .pipe(map(response => response.data));
  }

  getAdminProducts(filters: ProductFilters = {}): Observable<PageResponse<Producto>> {
    return this.http
      .get<ApiResponse<PageResponse<Producto>>>(apiUrl('/api/admin/productos'), {
        params: this.toParams(filters)
      })
      .pipe(map(response => response.data));
  }

  getAdminProduct(id: string): Observable<Producto> {
    return this.http
      .get<ApiResponse<Producto>>(apiUrl(`/api/admin/productos/${id}`))
      .pipe(map(response => response.data));
  }

  create(request: ProductoRequest): Observable<Producto> {
    return this.http
      .post<ApiResponse<Producto>>(apiUrl('/api/admin/productos'), request)
      .pipe(map(response => response.data));
  }

  update(id: string, request: ProductoRequest): Observable<Producto> {
    return this.http
      .put<ApiResponse<Producto>>(apiUrl(`/api/admin/productos/${id}`), request)
      .pipe(map(response => response.data));
  }

  changeStatus(id: string, activo: boolean): Observable<Producto> {
    return this.http
      .patch<ApiResponse<Producto>>(apiUrl(`/api/admin/productos/${id}/estado`), { activo })
      .pipe(map(response => response.data));
  }

  addImage(id: string, urlImagen: string, orden = 1): Observable<void> {
    return this.http
      .post<ApiResponse<unknown>>(apiUrl(`/api/admin/productos/${id}/imagenes`), { urlImagen, orden })
      .pipe(map(() => undefined));
  }

  removeImage(id: string, imageId: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(apiUrl(`/api/admin/productos/${id}/imagenes/${imageId}`))
      .pipe(map(() => undefined));
  }

  private toParams(filters: ProductFilters): HttpParams {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }
}
