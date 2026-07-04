import { HttpErrorResponse } from '@angular/common/http';

export function getHttpErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado.'): string {
  if (error instanceof HttpErrorResponse) {
    const validationData = error.error?.data;
    if (validationData && typeof validationData === 'object' && !Array.isArray(validationData)) {
      const messages = Object.values(validationData).filter((value): value is string =>
        typeof value === 'string' && value.trim().length > 0);
      if (messages.length) return messages.join(' ');
    }

    const apiMessage = error.error?.message;
    if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage;
    if (error.status === 0) {
      return 'No se pudo conectar con el backend. Verifica que Spring Boot esté ejecutándose.';
    }
  }
  return fallback;
}
