import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type TipoNotificacion = 'exito' | 'error' | 'info' | 'advertencia';

export interface NotificacionSistema {
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  icono: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionSistemaService {
  private notificacionSubject = new BehaviorSubject<NotificacionSistema | null>(null);
  notificacion$ = this.notificacionSubject.asObservable();

  private temporizador?: ReturnType<typeof setTimeout>;

  exito(titulo: string, mensaje: string): void {
    this.mostrar({ tipo: 'exito', titulo, mensaje, icono: 'check_circle' });
  }

  error(titulo: string, mensaje: string): void {
    this.mostrar({ tipo: 'error', titulo, mensaje, icono: 'error' });
  }

  info(titulo: string, mensaje: string): void {
    this.mostrar({ tipo: 'info', titulo, mensaje, icono: 'info' });
  }

  advertencia(titulo: string, mensaje: string): void {
    this.mostrar({ tipo: 'advertencia', titulo, mensaje, icono: 'warning' });
  }

  cerrar(): void {
    this.notificacionSubject.next(null);

    if (this.temporizador) {
      clearTimeout(this.temporizador);
      this.temporizador = undefined;
    }
  }

  private mostrar(notificacion: NotificacionSistema): void {
    this.cerrar();
    this.notificacionSubject.next(notificacion);

    this.temporizador = setTimeout(() => {
      this.notificacionSubject.next(null);
    }, 3200);
  }
}
