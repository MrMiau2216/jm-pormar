import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ClientService } from '../../shared/services/client.service';
import { ClientItem } from '../../shared/data/clients-data';
import { ContactService } from '../../shared/services/contact.service';
import { CertificationService } from '../../shared/services/certification.service';
import { Certificacion } from '../../shared/models/domain.models';

interface ValueItem {
  icon: string;
  title: string;
  description: string;
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
  clients: ClientItem[] = [];

  readonly atencionExperiencia = [
    {
      titulo: 'Obras y proyectos',
      descripcion: 'Atención para obras civiles, mantenimiento, ampliaciones y requerimientos por etapas.',
      imagen: '/images/about/atencion-obras.jpg'
    },
    {
      titulo: 'Empresas',
      descripcion: 'Suministro recurrente para operaciones, almacenes, mantenimiento y compras internas.',
      imagen: '/images/about/atencion-empresas.jpg'
    },
    {
      titulo: 'Instituciones',
      descripcion: 'Apoyo a instituciones públicas y privadas con requerimientos formales y documentación.',
      imagen: '/images/about/atencion-instituciones.jpg'
    },
    {
      titulo: 'Servicios generales',
      descripcion: 'Soluciones para instalaciones, mantenimiento preventivo y atención operativa.',
      imagen: '/images/about/atencion-servicios.jpg'
    }
  ];

  certificadoSeleccionado: any | null = null;
  certificadoVistaUrl: SafeResourceUrl | null = null;

  constructor(
    private clientService: ClientService,
    private contactService: ContactService,
    private certificationService: CertificationService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.clientService.getClients().subscribe(clients => {
      this.clients = clients;
      this.cdr.detectChanges();
    });

    this.certificationService.getPublic().subscribe({
      next: certifications => { this.certifications = certifications ?? []; this.cdr.detectChanges(); },
      error: () => { this.certifications = []; this.cdr.detectChanges(); }
    });
  }

  get certificacionesNosotros(): any[] {
    const source = (this as any).certifications ?? (this as any).certificaciones ?? [];
    return Array.isArray(source)
      ? source.filter((certificacion: any) => certificacion?.activo !== false)
      : [];
  }

  obtenerNombreCertificacion(certificacion: any): string {
    return certificacion?.nombre || certificacion?.titulo || 'Certificación registrada';
  }

  obtenerDescripcionCertificacion(certificacion: any): string {
    return certificacion?.descripcion || 'Documento de respaldo empresarial registrado por JM Pormar.';
  }

  obtenerTipoCertificacion(certificacion: any): string {
    return certificacion?.tipo || certificacion?.tipoArchivo || 'Certificación';
  }

  obtenerUrlCertificado(certificacion: any): string {
    const url =
      certificacion?.archivoUrl ||
      certificacion?.urlArchivo ||
      certificacion?.documentoUrl ||
      certificacion?.pdfUrl ||
      '';

    if (url.startsWith('http') || url.startsWith('/')) {
      return url;
    }

    const id =
      certificacion?.idCertificacion ||
      certificacion?.id ||
      certificacion?.uuid ||
      '';

    return id ? `/api/public/certificaciones/${id}/ver` : '#';
  }

  certificadoTieneVista(certificacion: any): boolean {
    return this.obtenerUrlCertificado(certificacion) !== '#';
  }

  abrirCertificado(certificacion: any): void {
    const url = this.obtenerUrlCertificado(certificacion);

    if (!url || url === '#') {
      return;
    }

    this.certificadoSeleccionado = certificacion;
    this.certificadoVistaUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  cerrarCertificado(): void {
    this.certificadoSeleccionado = null;
    this.certificadoVistaUrl = null;
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

  certifications: Certificacion[] = [];

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
}
