import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { LoginResponse } from '../../shared/models/domain.models';

export interface SesionInterna {
  idAdminUsuario: string;
  usuario: string;
  correo: string;
  nombreCompleto: string;
  fechaIngreso: string;
  rol: string;
}

@Injectable({ providedIn: 'root' })
export class AutenticacionInternaService {
  constructor(private readonly auth: AuthService) {}

  ingresar(usuarioOCorreo: string, clave: string): Observable<LoginResponse> {
    return this.auth.login({
      identificador: usuarioOCorreo.trim(),
      password: clave
    });
  }

  cerrarSesion(): void {
    this.auth.logout();
  }

  estaAutenticado(): boolean {
    return this.auth.isAuthenticated;
  }

  obtenerSesion(): SesionInterna | null {
    const session = this.auth.session;
    if (!session) return null;
    return {
      idAdminUsuario: session.idAdmin,
      usuario: session.usuario,
      correo: session.correo,
      nombreCompleto: session.usuario,
      fechaIngreso: new Date().toISOString(),
      rol: session.rol
    };
  }
}
