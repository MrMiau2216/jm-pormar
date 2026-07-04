import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { NotificacionSistemaService } from '../../servicios/notificacion-sistema.service';

@Component({
  selector: 'app-notificacion-sistema',
  imports: [CommonModule],
  templateUrl: './notificacion-sistema.html',
  styleUrl: './notificacion-sistema.scss'
})
export class NotificacionSistema {
  private notificacionService = inject(NotificacionSistemaService);
  notificacion$ = this.notificacionService.notificacion$;

  cerrar(): void {
    this.notificacionService.cerrar();
  }
}
