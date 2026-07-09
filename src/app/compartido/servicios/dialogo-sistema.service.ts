import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type TipoDialogo = 'confirmacion' | 'alerta' | 'exito' | 'error';

export interface ConfiguracionDialogo {
  tipo: TipoDialogo;
  titulo: string;
  mensaje: string;
  textoAceptar?: string;
  textoCancelar?: string;
  icono?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DialogoSistemaService {
  private dialogoSubject = new BehaviorSubject<ConfiguracionDialogo | null>(null);
  dialogo$ = this.dialogoSubject.asObservable();

  private resolver?: (valor: boolean) => void;

  confirmar(configuracion: ConfiguracionDialogo): Promise<boolean> {
    this.dialogoSubject.next({
      ...configuracion,
      tipo: 'confirmacion',
      textoAceptar: configuracion.textoAceptar || 'Aceptar',
      textoCancelar: configuracion.textoCancelar || 'Cancelar',
      icono: configuracion.icono || 'help'
    });

    return new Promise(resolve => {
      this.resolver = resolve;
    });
  }

  alerta(configuracion: ConfiguracionDialogo): Promise<boolean> {
    this.dialogoSubject.next({
      ...configuracion,
      tipo: configuracion.tipo || 'alerta',
      textoAceptar: configuracion.textoAceptar || 'Entendido',
      icono: configuracion.icono || 'info',
    });

    return new Promise(resolve => {
      this.resolver = resolve;
    });
  }

  cerrar(resultado: boolean): void {
    this.dialogoSubject.next(null);

    if (this.resolver) {
      this.resolver(resultado);
      this.resolver = undefined;
    }
  }
}
