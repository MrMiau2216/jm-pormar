import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { assetUrl } from '../../core/utils/api-url';
import { getHttpErrorMessage } from '../../core/utils/http-error';
import { Servicio } from '../../shared/models/domain.models';
import { ContactService } from '../../shared/services/contact.service';
import { ServiceService } from '../../shared/services/service.service';

interface ProcessStep { number: string; title: string; description: string; }

@Component({
  selector: 'app-services',
  imports: [CommonModule, RouterLink],
  templateUrl: './services.html',
  styleUrl: './services.scss'
})
export class Services implements OnInit {
  services: Servicio[] = [];
  loading = true;
  errorMessage = '';

  readonly processSteps: ProcessStep[] = [
    { number: '01', title: 'Recepción del requerimiento', description: 'El cliente comunica su necesidad de productos, servicios, materiales o apoyo para obra.' },
    { number: '02', title: 'Evaluación y coordinación', description: 'Se revisa el requerimiento, cantidades, destino, condiciones y prioridad de atención.' },
    { number: '03', title: 'Cotización y propuesta', description: 'Se prepara una propuesta de atención acorde al requerimiento solicitado.' },
    { number: '04', title: 'Atención y seguimiento', description: 'Se coordina la entrega, servicio o ejecución y se realiza seguimiento a la atención.' }
  ];

  constructor(
    private readonly serviceService: ServiceService,
    private readonly contactService: ContactService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.serviceService.getPublic()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: services => {
          this.services = [...services];
          this.cdr.detectChanges();
        },
        error: error => {
          this.services = [];
          this.errorMessage = getHttpErrorMessage(error, 'No se pudieron cargar los servicios.');
          this.cdr.detectChanges();
        }
      });
  }

  generalQuote(): void {
    this.contactService.openWhatsapp('Hola, deseo solicitar información sobre los servicios de JM Pormar.');
  }

  quoteService(serviceName: string): void {
    this.contactService.openWhatsapp(`Hola, deseo solicitar información y cotización sobre el servicio: ${serviceName}.`);
  }

  imageUrl(path?: string | null): string {
    return assetUrl(path, '/images/servicio-abastecimiento.jpg');
  }

  iconFor(name: string): string {
    const value = name.toLowerCase();
    if (value.includes('transporte') || value.includes('logíst')) return 'local_shipping';
    if (value.includes('mantenimiento')) return 'construction';
    if (value.includes('consult')) return 'engineering';
    return 'inventory_2';
  }
}
