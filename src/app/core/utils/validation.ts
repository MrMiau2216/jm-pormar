export const VALIDATION = {
  searchMax: 100,
  loginIdentifierMax: 150,
  passwordMin: 8,
  passwordMax: 72,
  categoryNameMin: 3,
  categoryNameMax: 100,
  categoryDescriptionMax: 2000,
  skuPattern: '^[A-Za-z0-9._/-]+$',
  skuMin: 2,
  skuMax: 50,
  productNameMin: 3,
  productNameMax: 150,
  shortDescriptionMax: 250,
  fullDescriptionMax: 5000,
  detailsMax: 4000,
  serviceProjectMax: 180,
  certificationTypeMin: 2,
  certificationTypeMax: 100,
  certificationDescriptionMax: 2000,
  orderMin: 1,
  orderMax: 100,
  whatsappPattern: '^[0-9]{9,15}$',
  rucPattern: '^$|^[0-9]{11}$',
  phonePattern: '^[0-9+() -]{7,20}$',
  addressMin: 5,
  addressMax: 250,
  scheduleMin: 5,
  scheduleMax: 180
} as const;

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function validateImageFile(file: File): string | null {
  return validateFile(file, 5 * 1024 * 1024, IMAGE_EXTENSIONS, IMAGE_MIME_TYPES,
    'Solo se permiten imágenes JPG, PNG o WEBP de máximo 5 MB.');
}

export function validateCertificationFile(file: File): string | null {
  return validateFile(file, 10 * 1024 * 1024,
    [...IMAGE_EXTENSIONS, 'pdf'], [...IMAGE_MIME_TYPES, 'application/pdf'],
    'Solo se permiten PDF, JPG, PNG o WEBP de máximo 10 MB.');
}

function validateFile(
  file: File,
  maxBytes: number,
  extensions: string[],
  mimeTypes: string[],
  message: string
): string | null {
  const extension = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : '';
  const validMime = !file.type || mimeTypes.includes(file.type);
  if (!extensions.includes(extension) || !validMime || file.size > maxBytes) {
    return message;
  }
  return null;
}
