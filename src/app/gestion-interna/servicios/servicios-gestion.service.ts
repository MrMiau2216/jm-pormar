import { Injectable } from '@angular/core';

export interface ServicioGestion {
  idServicio: string;
  nombre: string;
  proyectoRelacionado: string;
  descripcionBreve: string;
  descripcionCompleta: string;
  imagenPrincipalUrl: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

interface ServicioGestionAnterior extends Partial<ServicioGestion> {
  id?: number;
  orden?: number;
  destacado?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ServiciosGestionService {
  private readonly claveStorage = 'jm_pormar_servicios_gestion';

  private serviciosIniciales: ServicioGestion[] = [
    {
      idServicio: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      nombre: 'Abastecimiento de materiales',
      proyectoRelacionado: 'Obras civiles, empresas e instituciones',
      descripcionBreve: 'Suministro de materiales de construcción, ferretería y productos técnicos.',
      descripcionCompleta: 'Servicio orientado a la atención de requerimientos de materiales para obras, empresas, instituciones y proyectos. Se coordina disponibilidad, condiciones y atención según la necesidad del cliente.',
      imagenPrincipalUrl: '/images/servicio-abastecimiento.jpg',
      activo: true,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    },
    {
      idServicio: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      nombre: 'Suministro de herramientas y equipos',
      proyectoRelacionado: 'Mantenimiento, operaciones y trabajos técnicos',
      descripcionBreve: 'Atención de herramientas, equipos y artículos de uso operativo.',
      descripcionCompleta: 'Servicio enfocado en el suministro de herramientas manuales, eléctricas, equipos y artículos de apoyo para operaciones, mantenimiento y trabajos en campo.',
      imagenPrincipalUrl: '/images/servicio-herramientas.jpg',
      activo: true,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    },
    {
      idServicio: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      nombre: 'Atención de requerimientos empresariales',
      proyectoRelacionado: 'Empresas privadas e instituciones públicas',
      descripcionBreve: 'Gestión de requerimientos según necesidad del cliente.',
      descripcionCompleta: 'Servicio de atención directa para requerimientos empresariales, institucionales y de proyectos. Se realiza coordinación mediante cotización, confirmación de disponibilidad y condiciones de atención.',
      imagenPrincipalUrl: '/images/servicio-requerimientos.jpg',
      activo: true,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    }
  ];

  listar(): ServicioGestion[] {
    const datos = localStorage.getItem(this.claveStorage);

    if (!datos) {
      this.guardarTodo(this.serviciosIniciales);
      return this.serviciosIniciales;
    }

    const serviciosGuardados = JSON.parse(datos) as ServicioGestionAnterior[];
    const servicios = serviciosGuardados.map(servicio => this.normalizarServicio(servicio));

    if (serviciosGuardados.some(servicio => typeof servicio.idServicio !== 'string')) {
      this.guardarTodo(servicios);
    }

    return servicios;
  }

  listarActivos(): ServicioGestion[] {
    return this.listar().filter(servicio => servicio.activo);
  }

  crear(
    servicio: Omit<ServicioGestion, 'idServicio' | 'fechaCreacion' | 'fechaActualizacion'>
  ): ServicioGestion {
    const servicios = this.listar();

    const nuevoServicio: ServicioGestion = {
      ...servicio,
      idServicio: crypto.randomUUID(),
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    };

    servicios.push(nuevoServicio);
    this.guardarTodo(servicios);

    return nuevoServicio;
  }

  actualizar(idServicio: string, servicioActualizado: Partial<ServicioGestion>): void {
    const servicios = this.listar();

    const serviciosActualizados = servicios.map(servicio => {
      if (servicio.idServicio !== idServicio) {
        return servicio;
      }

      return {
        ...servicio,
        ...servicioActualizado,
        fechaActualizacion: new Date().toISOString()
      };
    });

    this.guardarTodo(serviciosActualizados);
  }

  cambiarEstado(idServicio: string): void {
    const servicios = this.listar();

    const serviciosActualizados = servicios.map(servicio => {
      if (servicio.idServicio !== idServicio) {
        return servicio;
      }

      return {
        ...servicio,
        activo: !servicio.activo,
        fechaActualizacion: new Date().toISOString()
      };
    });

    this.guardarTodo(serviciosActualizados);
  }

  existeNombre(nombre: string, idServicioActual?: string): boolean {
    const nombreLimpio = nombre.trim().toLowerCase();

    return this.listar().some(servicio =>
      servicio.nombre.trim().toLowerCase() === nombreLimpio &&
      servicio.idServicio !== idServicioActual
    );
  }

  private normalizarServicio(servicio: ServicioGestionAnterior): ServicioGestion {
    const fechaActual = new Date().toISOString();
    const servicioBase = this.serviciosIniciales.find(
      item => item.nombre.trim().toLowerCase() === servicio.nombre?.trim().toLowerCase()
    );

    return {
      idServicio: typeof servicio.idServicio === 'string'
        ? servicio.idServicio
        : servicioBase?.idServicio ?? crypto.randomUUID(),
      nombre: servicio.nombre ?? '',
      proyectoRelacionado: servicio.proyectoRelacionado ?? '',
      descripcionBreve: servicio.descripcionBreve ?? '',
      descripcionCompleta: servicio.descripcionCompleta ?? '',
      imagenPrincipalUrl: servicio.imagenPrincipalUrl ?? '',
      activo: servicio.activo ?? true,
      fechaCreacion: servicio.fechaCreacion ?? fechaActual,
      fechaActualizacion: servicio.fechaActualizacion ?? fechaActual
    };
  }

  private guardarTodo(servicios: ServicioGestion[]): void {
    localStorage.setItem(this.claveStorage, JSON.stringify(servicios));
  }
}
