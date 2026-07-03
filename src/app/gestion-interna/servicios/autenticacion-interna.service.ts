import { Injectable } from '@angular/core';

export interface AdminUsuarioGestion {
  idAdminUsuario: string;
  usuario: string;
  correo: string;
  nombres: string;
  apellidos: string;
  clave: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface SesionInterna {
  idAdminUsuario: string;
  usuario: string;
  correo: string;
  nombreCompleto: string;
  fechaIngreso: string;
}

@Injectable({
  providedIn: 'root'
})
export class AutenticacionInternaService {
  private readonly claveSesion = 'jm_pormar_sesion_interna';
  private readonly claveUsuarios = 'jm_pormar_admin_usuarios';

  private usuariosIniciales: AdminUsuarioGestion[] = [
    {
      idAdminUsuario: 'admin-1111-1111-1111-111111111111',
      usuario: 'admin',
      correo: 'admin@jmpormar.com',
      nombres: 'Administrador',
      apellidos: 'JM Pormar',
      clave: 'admin123',
      activo: true,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    }
  ];

  listarUsuarios(): AdminUsuarioGestion[] {
    const datos = localStorage.getItem(this.claveUsuarios);

    if (!datos) {
      localStorage.setItem(this.claveUsuarios, JSON.stringify(this.usuariosIniciales));
      return this.usuariosIniciales;
    }

    return JSON.parse(datos) as AdminUsuarioGestion[];
  }

  ingresar(usuarioOCorreo: string, clave: string): boolean {
    const usuarioLimpio = usuarioOCorreo.trim().toLowerCase();

    const usuarioEncontrado = this.listarUsuarios().find(usuario =>
      usuario.activo &&
      (
        usuario.usuario.trim().toLowerCase() === usuarioLimpio ||
        usuario.correo.trim().toLowerCase() === usuarioLimpio
      ) &&
      usuario.clave === clave
    );

    if (!usuarioEncontrado) {
      return false;
    }

    const sesion: SesionInterna = {
      idAdminUsuario: usuarioEncontrado.idAdminUsuario,
      usuario: usuarioEncontrado.usuario,
      correo: usuarioEncontrado.correo,
      nombreCompleto: `${usuarioEncontrado.nombres} ${usuarioEncontrado.apellidos}`,
      fechaIngreso: new Date().toISOString()
    };

    localStorage.setItem(this.claveSesion, JSON.stringify(sesion));

    return true;
  }

  cerrarSesion(): void {
    localStorage.removeItem(this.claveSesion);
  }

  estaAutenticado(): boolean {
    return localStorage.getItem(this.claveSesion) !== null;
  }

  obtenerSesion(): SesionInterna | null {
    const datos = localStorage.getItem(this.claveSesion);

    if (!datos) {
      return null;
    }

    return JSON.parse(datos) as SesionInterna;
  }
}
