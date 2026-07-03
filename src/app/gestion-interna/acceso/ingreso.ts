import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(
    private autenticacion: AutenticacionInternaService,
    private router: Router,
    private dialogo: DialogoSistemaService
  ) {}

  async ingresar(): Promise<void> {
    if (!this.usuario.trim() || !this.clave.trim()) {
      await this.dialogo.alerta({
        tipo: 'error',
        titulo: 'Datos incompletos',
        mensaje: 'Ingresa usuario y contraseña para continuar.',
        textoAceptar: 'Entendido',
        icono: 'error'
      });

      return;
    }

    const accesoValido = this.autenticacion.ingresar(this.usuario, this.clave);

    if (!accesoValido) {
      await this.dialogo.alerta({
        tipo: 'error',
        titulo: 'Acceso denegado',
        mensaje: 'Usuario o contraseña incorrectos.',
        textoAceptar: 'Intentar de nuevo',
        icono: 'lock'
      });

      return;
    }

    this.router.navigateByUrl('/portal-jmp-1622/inicio');
  }
}
