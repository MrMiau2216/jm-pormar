import { Injectable } from '@angular/core';

export type TipoArchivoCertificacion = 'PDF' | 'IMAGEN';

export interface CertificacionGestion {
  idCertificacion: string;
  nombre: string;
  tipo: string;
  descripcion: string;
  archivoUrl: string;
  tipoArchivo: TipoArchivoCertificacion;
  orden: number;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

interface CertificacionGestionAnterior {
  idCertificacion?: string;
  id?: number;
  nombre?: string;
  tipo?: string;
  descripcion?: string;
  archivoUrl?: string;
  tipoArchivo?: TipoArchivoCertificacion;
  orden?: number;
  activo?: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CertificacionesGestionService {
  private readonly claveStorage = 'jm_pormar_certificaciones_gestion';

  private certificacionesIniciales: CertificacionGestion[] = [
    {
      idCertificacion: 'cert-1111-1111-1111-111111111111',
      nombre: 'ISO 9001:2015',
      tipo: 'Sistema de Gestión de Calidad',
      descripcion: 'Certificación relacionada con gestión de calidad y mejora continua.',
      archivoUrl: '/certificates/iso-9001.pdf',
      tipoArchivo: 'PDF',
      orden: 1,
      activo: true,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    },
    {
      idCertificacion: 'cert-2222-2222-2222-222222222222',
      nombre: 'ISO 14001:2015',
      tipo: 'Sistema de Gestión Ambiental',
      descripcion: 'Certificación relacionada con la gestión ambiental de la organización.',
      archivoUrl: '/certificates/iso-14001.pdf',
      tipoArchivo: 'PDF',
      orden: 2,
      activo: true,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    },
    {
      idCertificacion: 'cert-3333-3333-3333-333333333333',
      nombre: 'ISO 37001',
      tipo: 'Sistema de Gestión Antisoborno',
      descripcion: 'Certificación orientada a prevención de soborno y buenas prácticas empresariales.',
      archivoUrl: '/certificates/iso-37001.pdf',
      tipoArchivo: 'PDF',
      orden: 3,
      activo: true,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    }
  ];

  listar(): CertificacionGestion[] {
    const datos = localStorage.getItem(this.claveStorage);

    if (!datos) {
      this.guardarTodo(this.certificacionesIniciales);
      return this.certificacionesIniciales;
    }

    const certificacionesGuardadas = JSON.parse(datos) as CertificacionGestionAnterior[];
    const certificaciones = certificacionesGuardadas.map(certificacion =>
      this.normalizarCertificacion(certificacion)
    );

    if (certificacionesGuardadas.some(certificacion => !certificacion.idCertificacion)) {
      this.guardarTodo(certificaciones);
    }

    return certificaciones;
  }

  listarActivas(): CertificacionGestion[] {
    return this.listar().filter(certificacion => certificacion.activo);
  }

  crear(
    certificacion: Omit<CertificacionGestion, 'idCertificacion' | 'fechaCreacion' | 'fechaActualizacion'>
  ): CertificacionGestion {
    const certificaciones = this.listar();

    const nuevaCertificacion: CertificacionGestion = {
      ...certificacion,
      idCertificacion: this.generarUuid(),
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    };

    certificaciones.push(nuevaCertificacion);
    this.guardarTodo(certificaciones);

    return nuevaCertificacion;
  }

  actualizar(idCertificacion: string, certificacionActualizada: Partial<CertificacionGestion>): void {
    const certificaciones = this.listar();

    const certificacionesActualizadas = certificaciones.map(certificacion => {
      if (certificacion.idCertificacion !== idCertificacion) {
        return certificacion;
      }

      return {
        ...certificacion,
        ...certificacionActualizada,
        fechaActualizacion: new Date().toISOString()
      };
    });

    this.guardarTodo(certificacionesActualizadas);
  }

  cambiarEstado(idCertificacion: string): void {
    const certificaciones = this.listar();

    const certificacionesActualizadas = certificaciones.map(certificacion => {
      if (certificacion.idCertificacion !== idCertificacion) {
        return certificacion;
      }

      return {
        ...certificacion,
        activo: !certificacion.activo,
        fechaActualizacion: new Date().toISOString()
      };
    });

    this.guardarTodo(certificacionesActualizadas);
  }

  existeNombre(nombre: string, idCertificacionActual?: string): boolean {
    const nombreLimpio = nombre.trim().toLowerCase();

    return this.listar().some(certificacion =>
      certificacion.nombre.trim().toLowerCase() === nombreLimpio &&
      certificacion.idCertificacion !== idCertificacionActual
    );
  }

  private normalizarCertificacion(
    certificacion: CertificacionGestionAnterior
  ): CertificacionGestion {
    const fechaActual = new Date().toISOString();
    const certificacionBase = this.certificacionesIniciales.find(
      item => item.nombre.toLowerCase() === certificacion.nombre?.toLowerCase()
    );

    return {
      idCertificacion: certificacion.idCertificacion
        ?? certificacionBase?.idCertificacion
        ?? this.generarUuid(),
      nombre: certificacion.nombre ?? '',
      tipo: certificacion.tipo ?? '',
      descripcion: certificacion.descripcion ?? '',
      archivoUrl: certificacion.archivoUrl ?? '',
      tipoArchivo: certificacion.tipoArchivo ?? 'PDF',
      orden: certificacion.orden ?? 1,
      activo: certificacion.activo ?? true,
      fechaCreacion: certificacion.fechaCreacion ?? fechaActual,
      fechaActualizacion: certificacion.fechaActualizacion ?? fechaActual
    };
  }

  private guardarTodo(certificaciones: CertificacionGestion[]): void {
    localStorage.setItem(this.claveStorage, JSON.stringify(certificaciones));
  }

  private generarUuid(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, caracter => {
      const numero = Math.random() * 16 | 0;
      const valor = caracter === 'x' ? numero : (numero & 0x3 | 0x8);
      return valor.toString(16);
    });
  }
}
