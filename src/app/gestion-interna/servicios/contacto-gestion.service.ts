import { Injectable } from '@angular/core';

export interface ConfiguracionContactoGestion {
  idConfiguracion: string;
  whatsapp: string;
  correo: string;
  direccion: string;
  horarioAtencion: string;
  ruc: string;
  googleMapsUrl: string;
  fechaActualizacion: string;
}

interface ConfiguracionContactoAnterior extends Partial<ConfiguracionContactoGestion> {
  razonSocial?: string;
  telefono?: string;
  ubicacion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactoGestionService {
  private readonly claveStorage = 'jm_pormar_contacto_gestion';

  private configuracionInicial: ConfiguracionContactoGestion = {
    idConfiguracion: 'config-1111-1111-1111-111111111111',
    whatsapp: '51949180383',
    correo: 'contacto@jmpormar.com',
    direccion: 'Lima, Perú',
    horarioAtencion: 'Lunes a sábado, previa coordinación',
    ruc: '20601234567',
    googleMapsUrl: 'https://www.google.com/maps',
    fechaActualizacion: new Date().toISOString()
  };

  obtenerConfiguracion(): ConfiguracionContactoGestion {
    const datos = localStorage.getItem(this.claveStorage);

    if (!datos) {
      this.guardarConfiguracion(this.configuracionInicial);
      return this.configuracionInicial;
    }

    const configuracionGuardada = JSON.parse(datos) as ConfiguracionContactoAnterior;
    const configuracion = this.normalizarConfiguracion(configuracionGuardada);

    if (!configuracionGuardada.idConfiguracion) {
      this.guardarConfiguracion(configuracion);
    }

    return configuracion;
  }

  actualizarConfiguracion(
    configuracion: Omit<ConfiguracionContactoGestion, 'fechaActualizacion'>
  ): ConfiguracionContactoGestion {
    const configuracionActualizada: ConfiguracionContactoGestion = {
      ...configuracion,
      fechaActualizacion: new Date().toISOString()
    };

    this.guardarConfiguracion(configuracionActualizada);

    return configuracionActualizada;
  }

  restaurarConfiguracion(): ConfiguracionContactoGestion {
    this.guardarConfiguracion(this.configuracionInicial);
    return this.configuracionInicial;
  }

  private normalizarConfiguracion(
    configuracion: ConfiguracionContactoAnterior
  ): ConfiguracionContactoGestion {
    return {
      idConfiguracion: configuracion.idConfiguracion ?? this.configuracionInicial.idConfiguracion,
      whatsapp: configuracion.whatsapp ?? this.configuracionInicial.whatsapp,
      correo: configuracion.correo ?? this.configuracionInicial.correo,
      direccion: configuracion.direccion ?? this.configuracionInicial.direccion,
      horarioAtencion: configuracion.horarioAtencion ?? this.configuracionInicial.horarioAtencion,
      ruc: configuracion.ruc ?? this.configuracionInicial.ruc,
      googleMapsUrl: configuracion.googleMapsUrl ?? this.configuracionInicial.googleMapsUrl,
      fechaActualizacion: configuracion.fechaActualizacion ?? new Date().toISOString()
    };
  }

  private guardarConfiguracion(configuracion: ConfiguracionContactoGestion): void {
    localStorage.setItem(this.claveStorage, JSON.stringify(configuracion));
  }
}
