import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { buildWhatsappUrl } from '../../shared/data/company-info';
import { ClientService } from '../../shared/services/client.service';
import { ClientItem } from '../../shared/data/clients-data';

interface ValueItem {
  icon: string;
  title: string;
  description: string;
}

interface ExperienceItem {
  icon: string;
  title: string;
  description: string;
}

interface CertificationItem {
  icon: string;
  name: string;
  detail: string;
  fileUrl: string;
  fileType: 'PDF' | 'IMAGE';
}

interface TrustItem {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-about',
  imports: [CommonModule, RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About implements OnInit {
  selectedCertification?: CertificationItem;
  safeCertificateUrl?: SafeResourceUrl;
  clients: ClientItem[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.clientService.getClients().subscribe(clients => {
      this.clients = clients;
    });
  }

  values: ValueItem[] = [
    {
      icon: 'gpp_good',
      title: 'Responsabilidad',
      description: 'Asumimos cada compromiso con seriedad, orden y seguimiento.'
    },
    {
      icon: 'handshake',
      title: 'Compromiso',
      description: 'Nos involucramos en los requerimientos de nuestros clientes.'
    },
    {
      icon: 'schedule',
      title: 'Cumplimiento',
      description: 'Buscamos atender cada solicitud en los plazos coordinados.'
    },
    {
      icon: 'verified',
      title: 'Calidad',
      description: 'Priorizamos productos, servicios y atención confiable.'
    },
    {
      icon: 'military_tech',
      title: 'Confianza',
      description: 'Construimos relaciones comerciales transparentes y sólidas.'
    },
    {
      icon: 'health_and_safety',
      title: 'Seguridad',
      description: 'Promovemos una atención responsable para obras y empresas.'
    }
  ];

  experience: ExperienceItem[] = [
    {
      icon: 'construction',
      title: 'Abastecimiento para obras',
      description: 'Atención de materiales, herramientas, equipos e insumos para proyectos.'
    },
    {
      icon: 'engineering',
      title: 'Servicios generales',
      description: 'Apoyo en mantenimiento, acondicionamiento y soluciones operativas.'
    },
    {
      icon: 'domain',
      title: 'Atención a empresas',
      description: 'Soporte para áreas de compras, logística y requerimientos corporativos.'
    },
    {
      icon: 'account_balance',
      title: 'Instituciones',
      description: 'Atención de requerimientos para entidades y proyectos especiales.'
    }
  ];

  certifications: CertificationItem[] = [
    {
      icon: 'workspace_premium',
      name: 'ISO 9001:2015',
      detail: 'Sistema de Gestión de Calidad',
      fileUrl: '/certificates/iso-9001.pdf',
      fileType: 'PDF'
    },
    {
      icon: 'eco',
      name: 'ISO 14001:2015',
      detail: 'Sistema de Gestión Ambiental',
      fileUrl: '/certificates/iso-14001.pdf',
      fileType: 'PDF'
    },
    {
      icon: 'gavel',
      name: 'ISO 37001',
      detail: 'Sistema de Gestión Antisoborno',
      fileUrl: '/certificates/iso-37001.pdf',
      fileType: 'PDF'
    },
    {
      icon: 'groups',
      name: 'BPL',
      detail: 'Buenas Prácticas Laborales',
      fileUrl: '/certificates/bpl.pdf',
      fileType: 'PDF'
    }
  ];

  trustItems: TrustItem[] = [
    {
      icon: 'support_agent',
      title: 'Atención directa',
      description: 'Comunicación cercana para entender cada requerimiento.'
    },
    {
      icon: 'all_inclusive',
      title: 'Soluciones integrales',
      description: 'Productos y servicios para obras, empresas e instituciones.'
    },
    {
      icon: 'apartment',
      title: 'Respaldo empresarial',
      description: 'Capacidad para atender requerimientos de diferentes sectores.'
    }
  ];

  get shouldCarousel(): boolean {
    return this.clients.length > 5;
  }

  get visibleClients(): ClientItem[] {
    return this.shouldCarousel
      ? [...this.clients, ...this.clients]
      : this.clients;
  }

  openWhatsapp(): void {
    const message = 'Hola, deseo solicitar información sobre JM Pormar y sus servicios.';
    window.open(buildWhatsappUrl(message), '_blank');
  }

  openCertificate(certification: CertificationItem): void {
    this.selectedCertification = certification;
    this.safeCertificateUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      certification.fileUrl
    );
  }

  closeCertificate(): void {
    this.selectedCertification = undefined;
    this.safeCertificateUrl = undefined;
  }
}
