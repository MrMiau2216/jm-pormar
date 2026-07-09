import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class SweetAlertService {
  exito(titulo: string, mensaje?: string): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'success',
      title: titulo,
      text: mensaje,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#b8844f'
    });
  }

  error(titulo: string, mensaje?: string): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'error',
      title: titulo,
      text: mensaje,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#b8844f'
    });
  }

  advertencia(titulo: string, mensaje?: string): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'warning',
      title: titulo,
      text: mensaje,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#b8844f'
    });
  }

  toast(titulo: string, icono: SweetAlertIcon = 'success'): Promise<SweetAlertResult> {
    return Swal.fire({
      toast: true,
      position: 'top-end',
      icon: icono,
      title: titulo,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true
    });
  }

  confirmar(
    titulo: string,
    mensaje: string,
    textoConfirmar = 'Sí, continuar',
    textoCancelar = 'Cancelar'
  ): Promise<SweetAlertResult<boolean>> {
    return Swal.fire<boolean>({
      icon: 'question',
      title: titulo,
      text: mensaje,
      showCancelButton: true,
      confirmButtonText: textoConfirmar,
      cancelButtonText: textoCancelar,
      confirmButtonColor: '#b8844f',
      cancelButtonColor: '#30343b',
      reverseButtons: true,
      focusCancel: true
    });
  }
}
