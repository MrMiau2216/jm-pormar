import { environment } from '../../../environments/environment';

export function apiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${environment.apiUrl}${normalized}`;
}

export function assetUrl(path?: string | null, fallback = '/images/product-placeholder.svg'): string {
  if (!path) {
    return fallback;
  }

  return apiUrl(path);
}
