import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { assetUrl } from '../../core/utils/api-url';
import { ClientItem } from '../../shared/data/clients-data';
import { Categoria, Certificacion, Servicio } from '../../shared/models/domain.models';
import { CategoryService } from '../../shared/services/category.service';
import { CertificationService } from '../../shared/services/certification.service';
import { ClientService } from '../../shared/services/client.service';
import { ContactService } from '../../shared/services/contact.service';
import { ServiceService } from '../../shared/services/service.service';

interface Sector { icon: string; title: string; }
interface ServiceItem { title: string; description: string; image: string; }
interface CategoryItem { icon: string; name: string; id: string; }
interface Reason { icon: string; title: string; description: string; }
interface CertificationItem { name: string; detail: string; }

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  clients: ClientItem[] = [];
  services: ServiceItem[] = [];
  categories: CategoryItem[] = [];
  certifications: CertificationItem[] = [];

  quoteForm = { nombre: '', empresa: '', razonSocial: '', ruc: '', telefono: '', detalle: '' };
  quoteErrorMessage = '';

  readonly sectors: Sector[] = [
    { icon: 'foundation', title: 'Constructoras' },
    { icon: 'apartment', title: 'Empresas e instituciones' },
    { icon: 'engineering', title: 'Obras y proyectos' },
    { icon: 'plumbing', title: 'Mantenimiento y acondicionamiento' }
  ];

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
    private readonly certificationService: CertificationService
  ) {}

  ngOnInit(): void {
    this.clientService.getClients().subscribe(clients => this.clients = clients);
    this.categoryService.getPublic().subscribe({ next: values => this.categories = values.map(value => this.mapCategory(value)), error: () => this.categories = [] });
    this.serviceService.getPublic().subscribe({ next: values => this.services = values.slice(0, 4).map(value => this.mapService(value)), error: () => this.services = [] });
    this.certificationService.getPublic().subscribe({ next: values => this.certifications = values.slice(0, 4).map(value => this.mapCertification(value)), error: () => this.certifications = [] });
  }

  onRucInput(): void {
    this.quoteForm.ruc = this.quoteForm.ruc.replace(/\D/g, '');
  }

  sendQuote(formDirective: NgForm): void {
    this.quoteErrorMessage = '';
    this.onRucInput();
    if (formDirective.invalid) {
      formDirective.control.markAllAsTouched();
      this.quoteErrorMessage = 'Corrige los campos marcados antes de enviar la solicitud.';
      return;
    }
    const message = `Hola JM Pormar, buen día.\n\nQuisiera solicitar una cotización. Les comparto mis datos:\n\nDATOS DEL SOLICITANTE\n• Nombre: ${this.quoteForm.nombre.trim()}\n• Empresa / Institución: ${this.quoteForm.empresa.trim() || 'No indicado'}\n• RUC: ${this.quoteForm.ruc || 'No indicado'}\n• Razón social: ${this.quoteForm.razonSocial.trim() || 'No indicada'}\n• Teléfono: ${this.quoteForm.telefono.trim()}\n\nDETALLE DEL REQUERIMIENTO\n${this.quoteForm.detalle.trim()}\n\nQuedo atento a su confirmación de disponibilidad, precio y tiempo de atención.\nGracias.`;
    this.contactService.openWhatsapp(message);
  }

  openGeneralWhatsapp(): void {
    this.contactService.openWhatsapp('Hola, deseo solicitar información sobre sus productos y servicios.');
  }

  get shouldCarousel(): boolean { return this.clients.length > 5; }
  get visibleClients(): ClientItem[] { return this.shouldCarousel ? [...this.clients, ...this.clients] : this.clients; }

  private mapCategory(category: Categoria): CategoryItem {
    const value = category.nombre.toLowerCase();
    const icon = value.includes('tuber') ? 'humidity_mid'
      : value.includes('electric') ? 'bolt'
      : value.includes('herramient') ? 'construction'
      : value.includes('protección') || value.includes('epp') ? 'shield'
      : value.includes('ferreter') ? 'handyman' : 'layers';
    return { id: category.idCategoria, name: category.nombre, icon };
  }

  private mapService(service: Servicio): ServiceItem {
    return { title: service.nombre, description: service.descripcionBreve, image: assetUrl(service.imagenPrincipalUrl, '/images/servicio-abastecimiento.jpg') };
  }

  private mapCertification(certification: Certificacion): CertificationItem {
    return { name: certification.nombre, detail: certification.tipo };
  }
}
