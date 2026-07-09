import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { getHttpErrorMessage } from '../../core/utils/http-error';
import { DialogoSistemaService } from '../../compartido/servicios/dialogo-sistema.service';
import { AutenticacionInternaService } from '../servicios/autenticacion-interna.service';

@Component({
  selector: 'app-ingreso',
  imports: [CommonModule, FormsModule],
  templateUrl: './ingreso.html',
  styleUrl: './ingreso.scss'
})
export class Ingreso {
  usuario = '';
  clave = '';
  procesando = false;

  constructor(
    private readonly autenticacion: AutenticacionInternaService,
    private readonly router: Router,
    private readonly dialogo: DialogoSistemaService
  ) {
    if (this.autenticacion.estaAutenticado()) {
      void this.router.navigateByUrl('/portal-jmp/inicio');
    }
  }

  async ingresar(form?: NgForm): Promise<void> {
    if (form?.invalid || !this.usuario.trim() || !this.clave) {
      form?.control.markAllAsTouched();
      await this.mostrarError('Datos incompletos', 'Ingresa un usuario o correo y una contraseña válida.');
      return;
    }

    this.procesando = true;
    this.autenticacion.ingresar(this.usuario, this.clave).subscribe({
      next: () => {
        this.procesando = false;
        void this.router.navigateByUrl('/portal-jmp/inicio');
      },
      error: async error => {
        this.procesando = false;
        await this.mostrarError('Acceso denegado', getHttpErrorMessage(error, 'Usuario o contraseña incorrectos.'));
      }
    });
  }

  private async mostrarError(titulo: string, mensaje: string): Promise<void> {
    await this.dialogo.alerta({ tipo: 'error', titulo, mensaje, textoAceptar: 'Entendido', icono: 'lock' });
  }
}
