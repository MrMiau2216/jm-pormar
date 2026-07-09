import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { Contacto } from '../../models/domain.models';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-public-footer',
  imports: [CommonModule, RouterLink],
  templateUrl: './public-footer.html',
  styleUrl: './public-footer.scss'
})
export class PublicFooter implements OnInit {
  readonly companyName = 'INVERSIONES JM PORMAR BIENES Y SERVICIOS E.I.R.L.';
  readonly shortName = 'JM Pormar';
  contact?: Contacto;
  currentYear = new Date().getFullYear();
  mostrarFooter = true;

  constructor(
    private readonly contactService: ContactService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router
  ) {
    this.actualizarVisibilidadFooter();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.actualizarVisibilidadFooter();
        this.cdr.markForCheck();
      });
  }

  ngOnInit(): void {
    this.contactService.getPublic().subscribe({
      next: value => {
        this.contact = value;
        this.cdr.markForCheck();
      },
      error: () => {
        this.contact = undefined;
        this.cdr.markForCheck();
      }
    });
  }

  formatPhone(number?: string | null): string {
    if (!number) {
      return 'No disponible';
    }

    return number.startsWith('51') && number.length === 11 ? `+51 ${number.slice(2, 5)} ${number.slice(5, 8)} ${number.slice(8)}` : number;
  }

  private actualizarVisibilidadFooter(): void {
    const rutaActual = this.router.url.split('?')[0].split('#')[0];
    this.mostrarFooter = !/^\/productos\/[^/]+$/.test(rutaActual);
  }
}
