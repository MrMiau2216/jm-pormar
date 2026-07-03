export const COMPANY_INFO = {
  name: 'INVERSIONES JM PORMAR BIENES Y SERVICIOS E.I.R.L.',
  shortName: 'JM Pormar',
  ruc: '20601234567',
  phoneDisplay: '+51 949 180 383',
  whatsappNumber: '51949180383',
  email: 'contacto@jmpormar.com',
  location: 'Lima, Perú',
  address: 'Lima, Perú'
};

export function buildWhatsappUrl(message: string): string {
  return `https://wa.me/${COMPANY_INFO.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
