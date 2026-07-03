import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { PublicHeader } from './shared/components/public-header/public-header';
import { PublicFooter } from './shared/components/public-footer/public-footer';
import { WhatsappFloatingButton } from './shared/components/whatsapp-floating-button/whatsapp-floating-button';
import { DialogoSistema } from './compartido/componentes/dialogo-sistema/dialogo-sistema';
import { NotificacionSistema } from './compartido/componentes/notificacion-sistema/notificacion-sistema';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    PublicHeader,
    PublicFooter,
    WhatsappFloatingButton,
    DialogoSistema,
    NotificacionSistema
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private router = inject(Router);
  esRutaInterna = false;

  constructor() {
    this.esRutaInterna = this.router.url.startsWith('/portal-jmp-1622');

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => {
        this.esRutaInterna = event.urlAfterRedirects.startsWith('/portal-jmp-1622');

        setTimeout(() => {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
          });
        }, 50);
      });
  }
}
