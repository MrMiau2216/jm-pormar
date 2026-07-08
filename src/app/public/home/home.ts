import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  catchError,
  finalize,
  forkJoin,
  map,
  of
} from 'rxjs';


import { SweetAlertService } from '../../compartido/servicios/sweet-alert.service';
import { getHttpErrorMessage } from '../../core/utils/http-error';
import { assetUrl } from '../../core/utils/api-url';
import {
  ClientItem
} from '../../shared/data/clients-data';
import {
  Categoria,
  Certificacion,
  Producto,
  Servicio
} from '../../shared/models/domain.models';
import {
  CategoryService
} from '../../shared/services/category.service';
import {
  CertificationService
} from '../../shared/services/certification.service';
import {
  ClientService
} from '../../shared/services/client.service';
import {
  ContactService
} from '../../shared/services/contact.service';
import {
  ProductService
} from '../../shared/services/product.service';
import {
  ServiceService
} from '../../shared/services/service.service';

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
  id: string;
}

interface Reason {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {


  consultandoRuc = false;

  private rucConsultado = '';
  private readonly destroyRef = inject(DestroyRef);

  readonly clients = signal<ClientItem[]>([]);
  readonly services = signal<ServiceItem[]>([]);
  readonly categories = signal<CategoryItem[]>([]);
  readonly featuredProducts = signal<Producto[]>([]);
  readonly certifications = signal<Certificacion[]>([]);
  readonly loadingLanding = signal(true);

  quoteForm = {
    nombre: '',
    empresa: '',
    razonSocial: '',
    ruc: '',
    telefono: '',
    detalle: ''
  };

  quoteErrorMessage = '';

  readonly sectors: Sector[] = [
    {
      icon: 'foundation',
      title: 'Constructoras'
    },
    {
      icon: 'apartment',
      title: 'Empresas e instituciones'
    },
    {
      icon: 'engineering',
      title: 'Obras y proyectos'
    },
    {
      icon: 'plumbing',
      title: 'Mantenimiento y acondicionamiento'
    }
  ];

  readonly reasons: Reason[] = [
    {
      icon: 'support_agent',
      title: 'Atención empresarial',
      description:
        'Atención directa para gestionar requerimientos corporativos de manera personalizada.'
    },
    {
      icon: 'inventory_2',
      title: 'Productos y servicios integrales',
      description:
        'Catálogo orientado a materiales, ferretería, herramientas y servicios complementarios.'
    },
    {
      icon: 'verified_user',
      title: 'Certificaciones',
      description:
        'Respaldo documental para fortalecer la confianza en nuestros procesos.'
    },
    {
      icon: 'chat',
      title: 'Comunicación directa',
      description:
        'Canal de WhatsApp para respuestas rápidas y seguimiento del requerimiento.'
    },
    {
      icon: 'handshake',
      title: 'Compromiso',
      description:
        'Responsabilidad en la atención, coordinación y cumplimiento de solicitudes.'
    },
    {
      icon: 'architecture',
      title: 'Soluciones para obra',
      description:
        'Alternativas prácticas para empresas, instituciones, obras y proyectos.'
    }
  ];

  constructor(
    private readonly clientService: ClientService,
    private readonly contactService: ContactService,
    private readonly categoryService: CategoryService,
    private readonly serviceService: ServiceService,
    private readonly productService: ProductService,
    private readonly certificationService: CertificationService,
    private readonly sweetAlert: SweetAlertService
  ) { }

  ngOnInit(): void {
    forkJoin({
      clients: this.clientService
        .getClients()
        .pipe(
          catchError(() => of([]))
        ),

      categories: this.categoryService
        .getPublic()
        .pipe(
          catchError(() => of([]))
        ),

      services: this.serviceService
        .getPublic()
        .pipe(
          catchError(() => of([]))
        ),

      products: this.productService
        .getPublicProducts({
          page: 0,
          size: 4
        })
        .pipe(
          map(page => page.content),
          catchError(() => of([]))
        ),

      certifications: this.certificationService
        .getPublic()
        .pipe(
          catchError(() => of([]))
        )
    })
      .pipe(
        finalize(() => {
          this.loadingLanding.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(result => {
        this.clients.set([...result.clients]);

        this.categories.set(
          result.categories
            .slice(0, 6)
            .map(category => this.mapCategory(category))
        );

        this.services.set(
          result.services
            .slice(0, 4)
            .map(service => this.mapService(service))
        );

        this.featuredProducts.set(
          result.products.slice(0, 4)
        );

        this.certifications.set(
          result.certifications.slice(0, 4)
        );
      });
  }

 onRucInput(): void {
  const rucNormalizado = (
    this.quoteForm.ruc ?? ''
  )
    .replace(/\D/g, '')
    .slice(0, 11);

  this.quoteForm.ruc = rucNormalizado;

  if (rucNormalizado !== this.rucConsultado) {
    this.quoteForm.razonSocial = '';
  }
}

  sendQuote(formDirective: NgForm): void {
    this.quoteErrorMessage = '';
    this.onRucInput();

    if (formDirective.invalid) {
      formDirective.control.markAllAsTouched();

      this.quoteErrorMessage =
        'Corrige los campos marcados antes de enviar la solicitud.';

      return;
    }

    const message =
      'Hola JM Pormar, buen día.\n\n' +
      'Quisiera solicitar una cotización. Les comparto mis datos:\n\n' +
      'DATOS DEL SOLICITANTE\n' +
      `• Nombre: ${this.quoteForm.nombre.trim()}\n` +
      `• Empresa / Institución: ${this.quoteForm.empresa.trim() || 'No indicado'
      }\n` +
      `• RUC: ${this.quoteForm.ruc || 'No indicado'}\n` +
      `• Razón social: ${this.quoteForm.razonSocial.trim() || 'No indicada'
      }\n` +
      `• Teléfono: ${this.quoteForm.telefono.trim()}\n\n` +
      'DETALLE DEL REQUERIMIENTO\n' +
      `${this.quoteForm.detalle.trim()}\n\n` +
      'Quedo atento a su confirmación de disponibilidad, ' +
      'precio y tiempo de atención.\nGracias.';

    this.contactService.openWhatsapp(message);
  }

  openGeneralWhatsapp(): void {
    this.contactService.openWhatsapp(
      'Hola JM Pormar, buen día. Deseo solicitar información sobre sus productos y servicios.'
    );
  }

  consultarRuc(): void {
  const ruc = this.quoteForm.ruc.trim();

  if (!/^\d{11}$/.test(ruc)) {
    this.sweetAlert.advertencia(
      'RUC inválido',
      'El RUC debe contener exactamente 11 dígitos.'
    );
    return;
  }

  if (this.consultandoRuc) {
    return;
  }

  this.consultandoRuc = true;

  this.contactService
    .consultarRucPublico(ruc)
    .pipe(
      finalize(() => {
        this.consultandoRuc = false;
      })
    )
    .subscribe({
      next: resultado => {
        const razonSocial =
          resultado.razonSocial?.trim() ?? '';

        if (!razonSocial) {
          this.rucConsultado = '';
          this.quoteForm.razonSocial = '';

          this.sweetAlert.advertencia(
            'RUC sin razón social',
            'La consulta no devolvió una razón social.'
          );

          return;
        }

        this.rucConsultado = ruc;
        this.quoteForm.razonSocial =
          razonSocial;

        if (!this.quoteForm.empresa.trim()) {
          this.quoteForm.empresa =
            razonSocial;
        }

        this.sweetAlert.exito(
          'RUC encontrado',
          razonSocial
        );
      },
      error: error => {
        this.rucConsultado = '';
        this.quoteForm.razonSocial = '';

        this.sweetAlert.error(
          'No se pudo consultar el RUC',
          getHttpErrorMessage(error)
        );
      }
    });
}

  openCertification(
    certification: Certificacion
  ): void {
    window.open(
      this.certificationService.viewUrl(
        certification.idCertificacion
      ),
      '_blank',
      'noopener,noreferrer'
    );
  }

  productImage(path?: string | null): string {
    return assetUrl(
      path,
      '/images/product-placeholder.svg'
    );
  }

  get shouldCarousel(): boolean {
    return this.clients().length > 5;
  }

  get visibleClients(): ClientItem[] {
    const values = this.clients();

    return this.shouldCarousel
      ? [...values, ...values]
      : values;
  }

  private mapCategory(
    category: Categoria
  ): CategoryItem {
    const value = category.nombre
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    const icon =
      value.includes('tuber')
        ? 'plumbing'
        : value.includes('electric')
          ? 'electrical_services'
          : value.includes('herramient')
            ? 'handyman'
            : value.includes('proteccion') ||
              value.includes('epp')
              ? 'health_and_safety'
              : value.includes('ferreter')
                ? 'construction'
                : value.includes('material')
                  ? 'foundation'
                  : 'inventory_2';

    return {
      id: category.idCategoria,
      name: category.nombre,
      icon
    };
  }

  private mapService(
    service: Servicio
  ): ServiceItem {
    return {
      title: service.nombre,
      description: service.descripcionBreve,
      image: assetUrl(
        service.imagenPrincipalUrl,
        '/images/servicio-abastecimiento.jpg'
      )
    };
  }
}
