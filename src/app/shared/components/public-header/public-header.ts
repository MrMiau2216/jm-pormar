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

  constructor(private router: Router) {}

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  goTo(path: string): void {
    this.isMenuOpen = false;

    const currentPath = this.router.url.split('?')[0].split('#')[0];

    if (currentPath === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.router.navigateByUrl(path).then(() => {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    });
  }
}
