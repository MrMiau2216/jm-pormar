import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { buildWhatsappUrl } from '../../shared/data/company-info';
import { ClientService } from '../../shared/services/client.service';
import { ClientItem } from '../../shared/data/clients-data';
import { RucLookupService } from '../../shared/services/ruc-lookup.service';

interface Sector {
  icon: string;
  title: string;
}

interface ServiceItem {
  title: string;
  description: string;
  image: string;
}

interface CategoryItem {
  icon: string;
  name: string;
}

interface Reason {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  clients: ClientItem[] = [];

  constructor(
    private clientService: ClientService,
    private rucLookupService: RucLookupService
  ) {}

  ngOnInit(): void {
    this.clientService.getClients().subscribe(clients => {
      this.clients = clients;
    });
  }

  quoteForm = {
    nombre: '',
    empresa: '',
    razonSocial: '',
    ruc: '',
    telefono: '',
    detalle: ''
  };

  rucMessage = '';
  rucSearching = false;

  onRucInput(): void {
    this.quoteForm.ruc = this.quoteForm.ruc.replace(/\D/g, '');

    if (this.quoteForm.ruc.length < 11) {
      this.quoteForm.razonSocial = '';
      this.rucMessage = '';
    }

    if (this.quoteForm.ruc.length === 11) {
      this.searchRuc();
    }
  }

  searchRuc(): void {
    const ruc = this.quoteForm.ruc.trim();

    if (!ruc) {
      this.quoteForm.razonSocial = '';
      this.rucMessage = '';
      return;
    }

    if (ruc.length !== 11) {
      this.quoteForm.razonSocial = '';
      this.rucMessage = 'El RUC debe tener 11 dígitos.';
      return;
    }

    this.rucSearching = true;
    this.rucMessage = 'Buscando razón social...';

    this.rucLookupService.searchByRuc(ruc).subscribe(result => {
      this.rucSearching = false;

      if (!result) {
        this.quoteForm.razonSocial = '';
        this.rucMessage = 'No se encontró razón social para este RUC.';
        return;
      }

      this.quoteForm.razonSocial = result.razonSocial;
      this.rucMessage = 'Razón social encontrada.';
    });
  }

  private validateQuoteForm(): boolean {
    if (!this.quoteForm.nombre.trim()) {
      alert('Ingresa tu nombre completo.');
      return false;
    }

    if (!this.quoteForm.telefono.trim()) {
      alert('Ingresa tu número de teléfono.');
      return false;
    }

    if (!this.quoteForm.detalle.trim()) {
      alert('Ingresa el detalle de tu requerimiento.');
      return false;
    }

    if (this.quoteForm.ruc && this.quoteForm.ruc.length !== 11) {
      alert('El RUC debe tener 11 dígitos.');
      return false;
    }

    if (this.quoteForm.ruc && !this.quoteForm.razonSocial) {
      alert('Valida el RUC para obtener la razón social.');
      return false;
    }

    return true;
  }

  sendQuote(): void {
    if (!this.validateQuoteForm()) {
      return;
    }

    const message = `
Hola JM Pormar, buen día.

Quisiera solicitar una cotización. Les comparto mis datos:

DATOS DEL SOLICITANTE
• Nombre: ${this.quoteForm.nombre}
• Empresa / Institución: ${this.quoteForm.empresa || 'No indicado'}
• RUC: ${this.quoteForm.ruc || 'No indicado'}
• Razón social: ${this.quoteForm.razonSocial || 'No indicada'}
• Teléfono: ${this.quoteForm.telefono}

DETALLE DEL REQUERIMIENTO
${this.quoteForm.detalle}

Quedo atento a su confirmación de disponibilidad, precio y tiempo de atención.
Gracias.
`.trim();

    window.open(buildWhatsappUrl(message), '_blank');
  }

  sectors: Sector[] = [
    { icon: 'foundation', title: 'Constructoras' },
    { icon: 'apartment', title: 'Empresas e instituciones' },
    { icon: 'engineering', title: 'Obras y proyectos' },
    { icon: 'plumbing', title: 'Mantenimiento y acondicionamiento' }
  ];

  openGeneralWhatsapp(): void {
    const message = 'Hola, deseo solicitar información sobre sus productos y servicios.';
    window.open(buildWhatsappUrl(message), '_blank');
  }

  

  services: ServiceItem[] = [
  {
    title: 'Abastecimiento para obras',
    description: 'Suministro de materiales, herramientas y equipos para obras, empresas y proyectos.',
    image: '/images/servicio-abastecimiento.jpg'
  },
  {
    title: 'Transporte de materiales',
    description: 'Apoyo en traslado y distribución de materiales para requerimientos operativos.',
    image: '/images/servicio-transporte.jpg'
  },
  {
    title: 'Mantenimiento y servicios',
    description: 'Trabajos de conservación, mejora y acondicionamiento de infraestructuras.',
    image: '/images/servicio-mantenimiento.jpg'
  },
  {
    title: 'Consultoría técnica',
    description: 'Apoyo en metrados, presupuestos, fichas técnicas y planificación de proyectos.',
    image: '/images/servicio-consultoria.jpg'
  }
];

categories: CategoryItem[] = [
  { icon: 'layers', name: 'Materiales' },
  { icon: 'handyman', name: 'Ferretería' },
  { icon: 'humidity_mid', name: 'Tuberías' },
  { icon: 'bolt', name: 'Electricidad' },
  { icon: 'construction', name: 'Herramientas' },
  { icon: 'shield', name: 'EPPS' }
];

reasons: Reason[] = [
  {
    icon: 'support_agent',
    title: 'Atención empresarial',
    description: 'Atención directa para gestionar requerimientos corporativos de manera personalizada.'
  },
  {
    icon: 'inventory_2',
    title: 'Productos y servicios integrales',
    description: 'Catálogo orientado a materiales, ferretería, herramientas y servicios complementarios.'
  },
  {
    icon: 'verified_user',
    title: 'Certificaciones',
    description: 'Respaldo documental para fortalecer la confianza en nuestros procesos.'
  },
  {
    icon: 'chat',
    title: 'Comunicación directa',
    description: 'Canal de WhatsApp para respuestas rápidas y seguimiento del requerimiento.'
  },
  {
    icon: 'handshake',
    title: 'Compromiso',
    description: 'Responsabilidad en la atención, coordinación y cumplimiento de solicitudes.'
  },
  {
    icon: 'architecture',
    title: 'Soluciones para obra',
    description: 'Alternativas prácticas para empresas, instituciones, obras y proyectos.'
  }
];

certifications = [
  { name: 'ISO 9001', detail: 'Calidad' },
  { name: 'ISO 14001', detail: 'Medio ambiente' },
  { name: 'ISO 37001', detail: 'Antisoborno' },
  { name: 'BPL', detail: 'Buenas prácticas' }
];

get shouldCarousel(): boolean {
  return this.clients.length > 5;
}

get visibleClients(): ClientItem[] {
  return this.shouldCarousel
    ? [...this.clients, ...this.clients]
    : this.clients;
}

}
