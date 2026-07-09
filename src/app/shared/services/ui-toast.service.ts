import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class UiToastService {
  mostrar(
    mensaje: string,
    icon: SweetAlertIcon = 'success',
    timer = 2400
  ): void {
    void Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title: mensaje,
      showConfirmButton: false,
      timer,
      timerProgressBar: true,
      customClass: {
        popup: 'jm-toast-popup'
      }
    });
  }

  exito(mensaje: string): void {
    this.mostrar(mensaje, 'success');
  }

  aviso(mensaje: string): void {
    this.mostrar(mensaje, 'warning');
  }

  error(mensaje: string): void {
    this.mostrar(mensaje, 'error', 3200);
  }

  info(mensaje: string): void {
    this.mostrar(mensaje, 'info');
  }
}
