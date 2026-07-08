export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface EstadoRequest {
  activo: boolean;
}
export interface ArchivoSubido {
  nombreOriginal: string;
  nombreAlmacenado: string;
  url: string;
  publicId?: string;
  resourceType?: 'image' | 'raw';
  contentType?: string | null;
  size: number;
}
