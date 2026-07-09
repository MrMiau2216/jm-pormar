import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { assetUrl } from '../../core/utils/api-url';
import { getHttpErrorMessage } from '../../core/utils/http-error';
import { Contacto, Servicio } from '../../shared/models/domain.models';
import { ContactService } from '../../shared/services/contact.service';
import { ServiceService } from '../../shared/services/service.service';
import { logError } from '../../shared/utils/app-logger.util';
import { abrirWhatsappDirecto, armarMensajeWhatsapp } from '../../shared/utils/whatsapp.util';

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
  contact?: Contacto;

  readonly areasApoyo = [
    { icono: 'engineering', titulo: 'Obras civiles' },
    { icono: 'business', titulo: 'Empresas privadas' },
    { icono: 'account_balance', titulo: 'Instituciones' },
    { icono: 'build', titulo: 'Mantenimiento' },
    { icono: 'inventory_2', titulo: 'Abastecimiento' },
    { icono: 'handyman', titulo: 'Servicios generales' }
  ];

  readonly procesoAtencion = [
    {
      numero: '1',
      titulo: 'Recibimos tu consulta',
      descripcion: 'Recepción del requerimiento técnico o comercial.'
    },
    {
      numero: '2',
      titulo: 'Revisamos el alcance',
      descripcion: 'Análisis de necesidades, materiales y tiempos.'
    },
    {
      numero: '3',
      titulo: 'Coordinamos la propuesta',
      descripcion: 'Definición de soluciones técnicas y operativas.'
    },
    {
      numero: '4',
      titulo: 'Enviamos la cotización',
      descripcion: 'Emisión de la propuesta formal para evaluación.'
    },
    {
      numero: '5',
      titulo: 'Damos seguimiento',
      descripcion: 'Acompañamiento hasta la atención del servicio.'
    }
  ];

  readonly respaldoServicios = [
    { icono: 'support_agent', titulo: 'Atención directa' },
    { icono: 'schedule', titulo: 'Coordinación rápida' },
    { icono: 'verified', titulo: 'Soluciones integrales' }
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

    this.contactService.getPublic().subscribe({
      next: contact => { this.contact = contact; this.cdr.detectChanges(); },
      error: () => { this.contact = undefined; this.cdr.detectChanges(); }
    });
  }

  solicitarInformacionGeneral(): void {
    try {
      const mensaje = armarMensajeWhatsapp([
        'Hola, buen día.',
        '',
        'Estoy interesado(a) en los servicios de JM Pormar.',
        'Me gustaría recibir más información sobre sus soluciones para empresas, obras y proyectos.',
        '',
        'Quedo atento(a) a su respuesta.',
        'Muchas gracias.'
      ]);

      abrirWhatsappDirecto(this.contact?.whatsapp, mensaje);
    } catch (error) {
      logError('SERVICIOS', 'WHATSAPP_GENERAL', error);
    }
  }

  solicitarServicioWhatsapp(servicio: any): void {
    try {
      const nombreServicio = this.obtenerTituloServicio(servicio);

      const mensaje = armarMensajeWhatsapp([
        'Hola, buen día.',
        '',
        `Estoy interesado(a) en solicitar más información sobre el servicio: ${nombreServicio}.`,
        '',
        'Me gustaría conocer disponibilidad, alcance del servicio y forma de atención.',
        '',
        'Quedo atento(a) a su respuesta.',
        'Muchas gracias.'
      ]);

      abrirWhatsappDirecto(this.contact?.whatsapp, mensaje);
    } catch (error) {
      logError('SERVICIOS', 'WHATSAPP_SERVICIO', error, servicio);
    }
  }

  get serviciosPublicos(): any[] {
    const source = (this as any).services ?? (this as any).servicios ?? [];
    return source.filter((servicio: any) => servicio?.activo !== false);
  }

  obtenerTituloServicio(servicio: any): string {
    return servicio?.titulo || servicio?.nombre || 'Servicio especializado';
  }

  obtenerDescripcionServicio(servicio: any): string {
    return (
      servicio?.descripcion ||
      servicio?.descripcionCorta ||
      servicio?.descripcionBreve ||
      'Atención especializada para empresas, obras, instituciones y proyectos.'
    );
  }

  obtenerImagenServicio(servicio: any, index: number): string {
    const imagen =
      servicio?.imagenPrincipalUrl ||
      servicio?.imagenUrl ||
      servicio?.urlImagen ||
      servicio?.imagen ||
      '';

    if (imagen) {
      return assetUrl(imagen);
    }

    const imagenes = [
      '/images/services/servicio-obras.jpg',
      '/images/services/servicio-mantenimiento.jpg',
      '/images/services/servicio-abastecimiento.jpg',
      '/images/services/servicio-instituciones.jpg'
    ];

    return imagenes[index % imagenes.length];
  }
}
