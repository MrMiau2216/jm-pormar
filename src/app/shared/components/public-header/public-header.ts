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

  constructor(
    private readonly router: Router
  ) {}

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  goToSection(sectionId: string): void {
    this.isMenuOpen = false;

    const currentPath = this.router.url
      .split('?')[0]
      .split('#')[0];

    if (currentPath === '/') {
      this.scrollToSection(sectionId);
      return;
    }

    void this.router
      .navigate(
        ['/'],
        {
          fragment: sectionId
        }
      )
      .then(() => {
        this.scrollToSection(sectionId);
      });
  }

  private scrollToSection(sectionId: string): void {
    window.setTimeout(() => {
      const section = document.getElementById(sectionId);

      section?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 50);
  }
}
