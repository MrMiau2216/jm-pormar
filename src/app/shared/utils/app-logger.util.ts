export type LogFeature =
  | 'HOME'
  | 'CONTACTO'
  | 'COTIZACION'
  | 'PRODUCTOS'
  | 'SERVICIOS'
  | 'ADMIN'
  | 'RUC'
  | 'WHATSAPP'
  | 'API';

export function logInfo(feature: LogFeature, action: string, data?: unknown): void {
  console.info(`[JM-PORMAR][${feature}][${action}]`, data ?? '');
}

export function logWarn(feature: LogFeature, action: string, data?: unknown): void {
  console.warn(`[JM-PORMAR][${feature}][${action}]`, data ?? '');
}

export function logError(feature: LogFeature, action: string, error: unknown, meta?: unknown): void {
  console.error(`[JM-PORMAR][${feature}][${action}]`, {
    error,
    meta
  });
}

export function obtenerMensajeError(error: any, fallback = 'No se pudo completar la operación.'): string {
  return (
    error?.error?.message ||
    error?.message ||
    fallback
  );
}
