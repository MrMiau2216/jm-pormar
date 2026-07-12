import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClientItem } from '../../shared/data/clients-data';
import { Categoria, Certificacion, Contacto, Servicio } from '../../shared/models/domain.models';
import { CategoryService } from '../../shared/services/category.service';
import { CertificationService } from '../../shared/services/certification.service';
import { ClientService } from '../../shared/services/client.service';
import { ContactService } from '../../shared/services/contact.service';
import { ServiceService } from '../../shared/services/service.service';
import { logError } from '../../shared/utils/app-logger.util';
import { abrirWhatsappDirecto, armarMensajeWhatsapp } from '../../shared/utils/whatsapp.util';

interface Reason { icon: string; title: string; description: string; }

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  clients: ClientItem[] = [];
  services: Servicio[] = [];
  categories: Categoria[] = [];
  certifications: Certificacion[] = [];
  certificationsTotal = 0;
  contact?: Contacto;

  quoteForm = { nombre: '', empresa: '', razonSocial: '', ruc: '', telefono: '', detalle: '' };
  quoteErrorMessage = '';

  readonly sectoresAtencion = [
    {
      titulo: 'Obras y proyectos',
      descripcion: 'Suministros y atención para obras civiles, mantenimiento y ejecución de proyectos.',
      imagen: '/images/home/sector-obras.jpg'
    },
    {
      titulo: 'Empresas',
      descripcion: 'Abastecimiento recurrente para operaciones, almacenes y requerimientos internos.',
      imagen: '/images/home/sector-empresas.jpg'
    },
    {
      titulo: 'Instituciones',
      descripcion: 'Atención a entidades, colegios, municipalidades y organizaciones con requerimientos formales.',
      imagen: '/images/home/sector-instituciones.jpg'
    },
    {
      titulo: 'Servicios generales',
      descripcion: 'Soluciones orientadas a mantenimiento, instalaciones y soporte operativo.',
      imagen: '/images/home/sector-servicios.jpg'
    }
  ];

  private ultimoRucConsultado = '';

  readonly imagenFallbackHome =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600"%3E%3Cdefs%3E%3ClinearGradient id="g" x1="0" x2="1" y1="0" y2="1"%3E%3Cstop stop-color="%232B2F36"/%3E%3Cstop offset="1" stop-color="%23A67C52"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="900" height="600" fill="url(%23g)"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23F5F3F0" font-family="Arial" font-size="42" font-weight="700"%3EJM Pormar%3C/text%3E%3C/svg%3E';

  readonly imagenFallbackLogo =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="160" viewBox="0 0 300 160"%3E%3Crect width="300" height="160" rx="22" fill="%23F5F3F0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%232B2F36" font-family="Arial" font-size="28" font-weight="700"%3ECliente%3C/text%3E%3C/svg%3E';

  readonly reasons: Reason[] = [
    { icon: 'support_agent', title: 'Atención empresarial', description: 'Atención directa para gestionar requerimientos corporativos de manera personalizada.' },
    { icon: 'inventory_2', title: 'Productos y servicios integrales', description: 'Catálogo orientado a materiales, ferretería, herramientas y servicios complementarios.' },
    { icon: 'verified_user', title: 'Certificaciones', description: 'Respaldo documental para fortalecer la confianza en nuestros procesos.' },
    { icon: 'chat', title: 'Comunicación directa', description: 'Canal de WhatsApp para respuestas rápidas y seguimiento del requerimiento.' },
    { icon: 'handshake', title: 'Compromiso', description: 'Responsabilidad en la atención, coordinación y cumplimiento de solicitudes.' },
    { icon: 'architecture', title: 'Soluciones para obra', description: 'Alternativas prácticas para empresas, instituciones, obras y proyectos.' }
  ];

  constructor(
    private readonly clientService: ClientService,
    private readonly contactService: ContactService,
    private readonly categoryService: CategoryService,
    private readonly serviceService: ServiceService,
    private readonly certificationService: CertificationService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.clientService.getClients().subscribe(clients => {
      this.clients = clients;
      this.cdr.detectChanges();
    });
    this.categoryService.getPublic().subscribe({
      next: values => { this.categories = values; this.cdr.detectChanges(); },
      error: () => { this.categories = []; this.cdr.detectChanges(); }
    });
    this.serviceService.getPublic().subscribe({
      next: values => { this.services = values; this.cdr.detectChanges(); },
      error: () => { this.services = []; this.cdr.detectChanges(); }
    });
    this.certificationService.getPublic().subscribe({
      next: values => {
        this.certificationsTotal = values.length;
        this.certifications = values;
        this.cdr.detectChanges();
      },
      error: () => { this.certificationsTotal = 0; this.certifications = []; this.cdr.detectChanges(); }
    });
    this.contactService.getPublic().subscribe({
      next: contact => { this.contact = contact; this.cdr.detectChanges(); },
      error: () => { this.contact = undefined; this.cdr.detectChanges(); }
    });
  }

  get clientesCarrusel(): ClientItem[] {
    return this.clients.length > 5 ? [...this.clients, ...this.clients] : this.clients;
  }

  get clientesAnimados(): boolean {
    return this.clients.length > 5;
  }

  obtenerNombreCliente(client: any): string {
    return client?.name || client?.nombre || client?.razonSocial || 'Cliente';
  }

  obtenerLogoCliente(client: any): string {
    return client?.logo || client?.logoUrl || client?.imagen || client?.imageUrl || '';
  }

  obtenerTituloServicio(servicio: any): string {
    return servicio?.titulo || servicio?.nombre || 'Servicio especializado';
  }

  obtenerDescripcionServicio(servicio: any): string {
    return servicio?.descripcion || servicio?.descripcionCorta || servicio?.descripcionBreve || 'Atención especializada para empresas, obras e instituciones.';
  }

  obtenerImagenServicio(servicio: any, index: number): string {
    return (
      servicio?.imagenPrincipalUrl ||
      servicio?.imagenUrl ||
      servicio?.urlImagen ||
      servicio?.imagen ||
      this.obtenerImagenPorIndice(index)
    );
  }

  obtenerTituloCategoria(categoria: any): string {
    return categoria?.nombre || categoria?.titulo || 'Línea de productos';
  }

  obtenerDescripcionCategoria(categoria: any): string {
    return categoria?.descripcion || 'Productos seleccionados para abastecimiento, mantenimiento y proyectos.';
  }

  obtenerImagenCategoria(categoria: any, index: number): string {
    return (
      categoria?.imagenUrl ||
      categoria?.urlImagen ||
      categoria?.imagen ||
      this.obtenerImagenPorIndice(index + 2)
    );
  }

  obtenerNombreCertificacion(certificacion: any): string {
    return certificacion?.nombre || certificacion?.titulo || 'Certificación registrada';
  }

  obtenerTipoCertificacion(certificacion: any): string {
    return certificacion?.tipo || certificacion?.tipoArchivo || 'Documento';
  }

  usarImagenFallback(event: Event): void {
    const imagen = event.target as HTMLImageElement;
    imagen.src = this.imagenFallbackHome;
  }

  usarLogoFallback(event: Event): void {
    const imagen = event.target as HTMLImageElement;
    imagen.src = this.imagenFallbackLogo;
  }

  obtenerServiciosInicio(): Servicio[] {
    return (this.services ?? []).slice(0, 6);
  }

  obtenerCategoriasInicio(): Categoria[] {
    return (this.categories ?? []).slice(0, 6);
  }

  obtenerCertificacionesInicio(): Certificacion[] {
    return (this.certifications ?? []).slice(0, 6);
  }

  private obtenerImagenPorIndice(index: number): string {
    const imagenes = [
      '/images/home/sector-obras.jpg',
      '/images/home/sector-empresas.jpg',
      '/images/home/sector-instituciones.jpg',
      '/images/home/sector-servicios.jpg'
    ];

    return imagenes[index % imagenes.length];
  }

  onRucInput(): void {
    this.quoteForm.ruc = this.quoteForm.ruc.replace(/\D/g, '');

    if (this.quoteForm.ruc.length !== 11) {
      this.quoteForm.razonSocial = '';
      this.ultimoRucConsultado = '';
      return;
    }

    if (this.ultimoRucConsultado === this.quoteForm.ruc) {
      return;
    }

    this.ultimoRucConsultado = this.quoteForm.ruc;

    this.contactService.consultarRuc(this.quoteForm.ruc).subscribe(result => {
      this.quoteForm.razonSocial = result?.razonSocial || '';
    });
  }

  formatPhone(number: string): string {
    return number.startsWith('51') && number.length === 11
      ? `+51 ${number.slice(2, 5)} ${number.slice(5, 8)} ${number.slice(8)}`
      : number;
  }

  sendQuote(formDirective: NgForm): void {
    this.quoteErrorMessage = '';
    this.onRucInput();
    if (formDirective.invalid) {
      formDirective.control.markAllAsTouched();
      this.quoteErrorMessage = 'Corrige los campos marcados antes de enviar la solicitud.';
      return;
    }
    const f = this.quoteForm;

    try {
      const mensaje = armarMensajeWhatsapp([
        'Hola, buen día.',
        '',
        `Mi nombre es ${f.nombre.trim() || 'cliente interesado'}.`,
        f.razonSocial ? `Represento a: ${f.razonSocial.trim()}` : null,
        f.ruc ? `RUC: ${f.ruc}` : null,
        f.telefono ? `Teléfono de contacto: ${f.telefono.trim()}` : null,
        '',
        'Me gustaría solicitar información o una cotización.',
        '',
        f.detalle ? `NECESITO\n${f.detalle.trim()}` : null,
        '',
        'Quedo atento(a) a su respuesta.',
        'Muchas gracias.'
      ]);

      abrirWhatsappDirecto(this.contact?.whatsapp, mensaje);
    } catch (error) {
      logError('HOME', 'FORMULARIO_RAPIDO_WHATSAPP', error, f);
    }
  }

  cotizarGeneralWhatsapp(): void {
    try {
      const mensaje = armarMensajeWhatsapp([
        'Hola, buen día.',
        '',
        'Estoy interesado(a) en los productos y servicios de JM Pormar.',
        'Me gustaría solicitar una cotización o recibir asesoría comercial.',
        '',
        'Quedo atento(a) a su respuesta.',
        'Muchas gracias.'
      ]);

      abrirWhatsappDirecto(this.contact?.whatsapp, mensaje);
    } catch (error) {
      logError('HOME', 'WHATSAPP_GENERAL', error);
    }
  }
}
