import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { apiUrl } from '../../core/utils/api-url';

interface ApiResponse<T> {
  data: T;
}

export interface ArchivoSubido {
  nombreOriginal: string;
  nombreAlmacenado: string;
  url: string;
  publicId: string;
  resourceType: string;
  contentType: string;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(
    private readonly http: HttpClient
  ) {}

 upload(
  carpeta: 'productos' | 'servicios' | 'certificaciones',
  file: File
): Observable<ArchivoSubido> {
  const formData = new FormData();

  formData.append(
    'file',
    file,
    file.name
  );

  return this.http
    .post<ApiResponse<ArchivoSubido>>(
      apiUrl(`/api/admin/archivos/${carpeta}`),
      formData
    )
    .pipe(
      map(response => response.data)
    );
}
}