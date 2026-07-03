import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DialogoSistemaService } from '../../servicios/dialogo-sistema.service';

@Component({
  selector: 'app-dialogo-sistema',
  imports: [CommonModule],
  templateUrl: './dialogo-sistema.html',
  styleUrl: './dialogo-sistema.scss'
})
export class DialogoSistema {
  private dialogoService = inject(DialogoSistemaService);
  dialogo$ = this.dialogoService.dialogo$;

  aceptar(): void {
    this.dialogoService.cerrar(true);
  }

  cancelar(): void {
    this.dialogoService.cerrar(false);
  }
}
