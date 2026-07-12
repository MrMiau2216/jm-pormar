import { environment } from '../../../environments/environment';

export function apiUrl(path: string): string {
  const value = path.trim();

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('blob:') ||
    value.startsWith('data:')
  ) {
    return value;
  }

  const normalized =
    value.startsWith('/')
      ? value
      : `/${value}`;

  return `${environment.apiUrl}${normalized}`;
}

export function assetUrl(
  path?: string | null,
  fallback = ''
): string {
  const value = path?.trim();

  if (!value) {
    return fallback;
  }

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('blob:') ||
    value.startsWith('data:')
  ) {
    return value;
  }

  /*
   * Todo lo que empiece con /api debe ir al backend,
   * no al servidor Angular localhost:4200.
   */
  if (
    value.startsWith('/api/') ||
    value.startsWith('api/')
  ) {
    return apiUrl(value);
  }

  /*
   * Archivos propios del frontend:
   * /images/logo.svg
   * /assets/...
   */
  if (value.startsWith('/')) {
    return value;
  }

  return `/${value}`;
}
