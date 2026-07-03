import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { PublicHeader } from './shared/components/public-header/public-header';
import { PublicFooter } from './shared/components/public-footer/public-footer';
import { WhatsappFloatingButton } from './shared/components/whatsapp-floating-button/whatsapp-floating-button';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    PublicHeader,
    PublicFooter,
    WhatsappFloatingButton
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private router = inject(Router);

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe(() => {
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
