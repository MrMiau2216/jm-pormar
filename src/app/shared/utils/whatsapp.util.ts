export function limpiarNumeroWhatsapp(numero?: string | null): string {
  const digitos = (numero ?? '').replace(/\D/g, '');
  return digitos.length === 9 ? `51${digitos}` : digitos;
}

export function limpiarTextoWhatsapp(texto: string): string {
  return texto
    // Elimina caracteres rotos tipo U+FFFD
    .replace(/�/g, '')
    // Elimina emojis y símbolos especiales que WhatsApp Web puede mostrar mal
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/[\u{2600}-\u{27BF}]/gu, '')
    // Limpia espacios excesivos por línea
    .split('\n')
    .map(linea => linea.trimEnd())
    .join('\n')
    .trim();
}

export function armarMensajeWhatsapp(lineas: Array<string | null | undefined | false>): string {
  const mensaje = lineas
    .filter(linea => typeof linea === 'string' && linea.trim().length > 0)
    .map(linea => String(linea).trim())
    .join('\n');

  return limpiarTextoWhatsapp(mensaje);
}

export function abrirWhatsappDirecto(numero: string | null | undefined, mensaje: string): void {
  const numeroLimpio = limpiarNumeroWhatsapp(numero);

  if (!numeroLimpio) {
    console.warn('[JM-PORMAR][WHATSAPP][NUMERO_NO_CONFIGURADO]');
    return;
  }

  const texto = encodeURIComponent(limpiarTextoWhatsapp(mensaje));
  const url = `https://wa.me/${numeroLimpio}?text=${texto}`;

  window.open(url, '_blank', 'noopener,noreferrer');
}
