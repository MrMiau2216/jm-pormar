import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ClientService } from '../../shared/services/client.service';
import { ClientItem } from '../../shared/data/clients-data';
import { ContactService } from '../../shared/services/contact.service';
import { CertificationService } from '../../shared/services/certification.service';

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
  id: string;
  icon: string;
  name: string;
  detail: string;
  fileUrl: string;
  fileType: 'PDF' | 'IMAGEN';
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
    private clientService: ClientService,
    private contactService: ContactService,
    private certificationService: CertificationService
  ) {}

  ngOnInit(): void {
    this.clientService.getClients().subscribe(clients => {
      this.clients = clients;
    });

    this.certificationService.getPublic().subscribe({
      next: certifications => {
        this.certifications = certifications.map(item => ({
          id: item.idCertificacion,
          icon: item.tipoArchivo === 'PDF' ? 'picture_as_pdf' : 'workspace_premium',
          name: item.nombre,
          detail: item.tipo,
          fileUrl: this.certificationService.viewUrl(item.idCertificacion),
          fileType: item.tipoArchivo
        }));
      },
      error: () => this.certifications = []
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

  certifications: CertificationItem[] = [];

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
    this.contactService.openWhatsapp(message);
  }

  openCertificate(certification: CertificationItem): void {
    this.selectedCertification = certification;
    this.safeCertificateUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.certificationService.viewUrl(certification.id)
    );
  }

  closeCertificate(): void {
    this.selectedCertification = undefined;
    this.safeCertificateUrl = undefined;
  }
}
