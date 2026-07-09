import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AdminToastService {
  mostrar(mensaje: string, icon: SweetAlertIcon = 'success'): void {
    void Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title: mensaje,
      showConfirmButton: false,
      timer: 2200,
      timerProgressBar: true
    });
  }

  exito(mensaje: string): void {
    this.mostrar(mensaje, 'success');
  }

  error(mensaje: string): void {
    this.mostrar(mensaje, 'error');
  }

  aviso(mensaje: string): void {
    this.mostrar(mensaje, 'warning');
  }

  info(mensaje: string): void {
    this.mostrar(mensaje, 'info');
  }
}
