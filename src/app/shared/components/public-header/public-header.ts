import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-public-header',
  imports: [],
  templateUrl: './public-header.html',
  styleUrl: './public-header.scss'
})
export class PublicHeader {
  isMenuOpen = false;

  private readonly headerOffset = 88;

  constructor(private readonly router: Router) {}

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  goTo(path: string, fragment?: string): void {
    this.isMenuOpen = false;

    const currentPath = this.router.url
      .split('?')[0]
      .split('#')[0];

    if (currentPath === path) {
      this.actualizarFragment(fragment);
      this.desplazarASeccion(fragment);
      return;
    }

    const destination = fragment
      ? `${path}#${fragment}`
      : path;

    void this.router.navigateByUrl(destination).then(() => {
      this.desplazarASeccion(fragment);
    });
  }

  private actualizarFragment(fragment?: string): void {
    const url = fragment
      ? `${window.location.pathname}#${fragment}`
      : window.location.pathname;

    window.history.replaceState(
      window.history.state,
      '',
      url
    );
  }

  private desplazarASeccion(fragment?: string): void {
    if (!fragment) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }

    let intentos = 0;
    const maxIntentos = 10;

    const buscarElemento = (): void => {
      const elemento = document.getElementById(fragment);

      if (elemento) {
        const posicion =
          elemento.getBoundingClientRect().top +
          window.scrollY -
          this.headerOffset;

        window.scrollTo({
          top: Math.max(posicion, 0),
          behavior: 'smooth'
        });
        return;
      }

      intentos++;

      if (intentos < maxIntentos) {
        window.setTimeout(buscarElemento, 50);
      }
    };

    window.setTimeout(buscarElemento, 0);
  }
}
