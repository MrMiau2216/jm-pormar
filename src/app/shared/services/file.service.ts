import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { apiUrl } from '../../core/utils/api-url';
import { ApiResponse } from '../models/api.models';
import { ArchivoResponse } from '../models/domain.models';

export type UploadFolder = 'productos' | 'servicios' | 'certificaciones';

@Injectable({ providedIn: 'root' })
export class FileService {
  constructor(private readonly http: HttpClient) {}

  upload(folder: UploadFolder, file: File): Observable<ArchivoResponse> {
    const body = new FormData();
    body.append('file', file);
    return this.http.post<ApiResponse<ArchivoResponse>>(apiUrl(`/api/admin/archivos/${folder}`), body)
      .pipe(map(response => response.data));
  }
}
