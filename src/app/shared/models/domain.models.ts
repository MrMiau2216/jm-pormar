export type DisponibilidadProducto = 'DISPONIBLE' | 'NO_DISPONIBLE';
export type TipoArchivoCertificacion = 'PDF' | 'IMAGEN';

export interface Categoria {
  idCategoria: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string | null;
}

export interface ProductoImagen {
  idImagen: string;
  urlImagen: string;
  orden: number;
  activo: boolean;
}

export interface Producto {
  idProducto: string;
  idCategoria: string;
  categoria: string;
  codigoSku: string;
  nombre: string;
  disponibilidad: DisponibilidadProducto;
  descripcionBreve: string;
  descripcionCompleta: string;
  caracteristicas: string | null;
  especificacionesTecnicas: string | null;
  imagenPrincipalUrl: string | null;
  activo: boolean;
  imagenes: ProductoImagen[];
  fechaCreacion: string;
  fechaActualizacion: string | null;
}

export interface ProductoRequest {
  idCategoria: string;
  codigoSku: string;
  nombre: string;
  disponibilidad: DisponibilidadProducto;
  descripcionBreve: string;
  descripcionCompleta: string;
  caracteristicas: string | null;
  especificacionesTecnicas: string | null;
  imagenPrincipalUrl: string | null;
  activo: boolean;
}

export interface ServicioImagen {
  idImagen: string;
  urlImagen: string;
  orden: number;
  activo: boolean;
}

export interface Servicio {
  idServicio: string;
  nombre: string;
  proyectoRelacionado: string | null;
  descripcionBreve: string;
  descripcionCompleta: string;
  imagenPrincipalUrl: string | null;
  activo: boolean;
  imagenes: ServicioImagen[];
  fechaCreacion: string;
  fechaActualizacion: string | null;
}

export interface ServicioRequest {
  nombre: string;
  proyectoRelacionado: string | null;
  descripcionBreve: string;
  descripcionCompleta: string;
  imagenPrincipalUrl: string | null;
  activo: boolean;
}

export interface Certificacion {
  idCertificacion: string;
  nombre: string;
  tipo: string;
  descripcion: string | null;
  archivoUrl: string;
  tipoArchivo: TipoArchivoCertificacion;
  orden: number;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string | null;
}

export interface CertificacionRequest {
  nombre: string;
  tipo: string;
  descripcion: string | null;
  archivoUrl: string;
  tipoArchivo: TipoArchivoCertificacion;
  orden: number;
  activo: boolean;
}

export interface Contacto {
  idConfiguracion: string;
  whatsapp: string;
  correo: string;
  direccion: string;
  horarioAtencion: string;
  ruc: string | null;
  fechaActualizacion: string;
}

export interface ContactoRequest {
  whatsapp: string;
  correo: string;
  direccion: string;
  horarioAtencion: string;
  ruc: string;
}

export interface Dashboard {
  totalProductos: number;
  productosActivos: number;
  productosNoDisponibles: number;
  totalCategorias: number;
  serviciosActivos: number;
  certificacionesActivas: number;
  contactoConfigurado: boolean;
}

export interface LoginRequest {
  identificador: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  idAdmin: string;
  usuario: string;
  correo: string;
  rol: string;
}

export interface AdminSession {
  idAdmin: string;
  usuario: string;
  correo: string;
  rol: string;
}

export interface ArchivoResponse {
  nombreOriginal: string;
  nombreAlmacenado: string;
  url: string;
  contentType: string;
  size: number;
}

export interface QuoteItem {
  id: string;
  code: string;
  name: string;
  category: string;
  quantity: number;
}
