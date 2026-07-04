import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';
import {
  EMPTY,
  catchError,
  finalize,
  forkJoin,
  of,
  switchMap,
  tap
} from 'rxjs';

import { SweetAlertService } from '../../compartido/servicios/sweet-alert.service';
import { assetUrl } from '../../core/utils/api-url';
import { getHttpErrorMessage } from '../../core/utils/http-error';
import {
  parseLines,
  parseSpecifications
} from '../../core/utils/text-parser';
import { Producto } from '../../shared/models/domain.models';
import { ContactService } from '../../shared/services/contact.service';
import { ProductService } from '../../shared/services/product.service';
import { QuoteService } from '../../shared/services/quote.service';

@Component({
  selector: 'app-product-detail',
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetail implements OnInit {

  private readonly destroyRef = inject(DestroyRef);

  readonly product = signal<Producto | null>(null);
  readonly relatedProducts = signal<Producto[]>([]);
  readonly selectedImage = signal('');
  readonly quantity = signal(1);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  readonly characteristics = computed(() =>
    parseLines(this.product()?.caracteristicas)
  );

  readonly specifications = computed(() =>
    parseSpecifications(
      this.product()?.especificacionesTecnicas
    )
  );

  readonly gallery = computed(() => {
    const current = this.product();

    if (!current) {
      return [];
    }

    const additionalImages = [
      ...(current.imagenes ?? [])
    ]
      .filter(image => image.activo)
      .sort(
        (first, second) =>
          first.orden - second.orden
      )
      .map(image => image.urlImagen);

    const images = [
      current.imagenPrincipalUrl,
      ...additionalImages
    ]
      .filter(
        (value): value is string =>
          Boolean(value?.trim())
      )
      .map(image => this.imageUrl(image));

    return [...new Set(images)];
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly productService: ProductService,
    private readonly quoteService: QuoteService,
    private readonly contactService: ContactService,
    private readonly sweetAlert: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.errorMessage.set('');
          this.product.set(null);
          this.relatedProducts.set([]);
          this.selectedImage.set('');
          this.quantity.set(1);
        }),
        switchMap(params => {
          const id = params.get('id');

          if (!id) {
            this.errorMessage.set(
              'No se recibió el identificador del producto.'
            );
            this.loading.set(false);
            return EMPTY;
          }

          return this.productService
            .getPublicProduct(id)
            .pipe(
              switchMap(product =>
                forkJoin({
                  product: of(product),
                  related: this.productService
                    .getRelatedProducts(product.idProducto)
                    .pipe(
                      catchError(() => of([]))
                    )
                })
              ),
              tap(({ product, related }) => {
                this.product.set(product);
                this.relatedProducts.set([
                  ...related
                ]);
                this.quantity.set(1);

                const firstImage =
                  this.buildGallery(product)[0];

                this.selectedImage.set(
                  firstImage ??
                  this.imageUrl(
                    product.imagenPrincipalUrl
                  )
                );
              }),
              catchError(error => {
                this.product.set(null);
                this.relatedProducts.set([]);
                this.selectedImage.set('');

                this.errorMessage.set(
                  getHttpErrorMessage(
                    error,
                    'El producto no existe o no está publicado.'
                  )
                );

                return EMPTY;
              }),
              finalize(() => {
                this.loading.set(false);
              })
            );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  selectImage(image: string): void {
    this.selectedImage.set(image);
  }

  increaseQuantity(): void {
    this.quantity.update(value => value + 1);
  }

  decreaseQuantity(): void {
    this.quantity.update(value =>
      value > 1 ? value - 1 : 1
    );
  }

  addToQuote(): void {
    const current = this.product();

    if (!current) {
      void this.sweetAlert.error(
        'Producto no disponible',
        'No fue posible obtener la información del producto.'
      );
      return;
    }

    if (
      current.disponibilidad !== 'DISPONIBLE'
    ) {
      void this.sweetAlert.advertencia(
        'Producto no disponible',
        'Este producto no está disponible para cotización.'
      );
      return;
    }

    this.quoteService.add(
      current,
      this.quantity()
    );

    void this.sweetAlert.toast(
      this.quantity() === 1
        ? 'Producto agregado a la cotización'
        : `${this.quantity()} unidades agregadas a la cotización`
    );
  }

  quoteByWhatsapp(): void {
    const current = this.product();

    if (!current) {
      void this.sweetAlert.error(
        'Producto no disponible',
        'No fue posible obtener la información del producto.'
      );
      return;
    }

    const orderNumber = this.generateOrderNumber();
    const orderDate = this.formatOrderDate(new Date());

    const message =
      `*PEDIDO N.° ${orderNumber}*\n` +
      `*Fecha:* ${orderDate}\n\n` +
      'Hola JM Pormar, buen día.\n\n' +
      '*ESTOY INTERESADO EN:*\n' +
      `1. *Producto:* ${current.nombre}\n` +
      `   *Código:* ${current.codigoSku}\n` +
      `   *Categoría:* ${current.categoria}\n` +
      `   *Cantidad:* ${this.quantity()}\n` +
      `   *Disponibilidad:* ${
        current.disponibilidad === 'DISPONIBLE'
          ? 'Disponible'
          : 'No disponible'
      }\n\n` +
      '*SOLICITUD:*\n' +
      'Por favor, confirmar precio, disponibilidad, ' +
      'tiempo de atención y forma de entrega.\n\n' +
      `*Enlace del producto:* ${window.location.href}\n\n` +
      'Gracias.';

    this.contactService.openWhatsapp(message);
  }

  private generateOrderNumber(): string {
    const now = new Date();
    const pad = (value: number): string =>
      value.toString().padStart(2, '0');

    return [
      'JMP',
      `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`,
      `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
    ].join('-');
  }

  private formatOrderDate(date: Date): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  imageUrl(path?: string | null): string {
    return assetUrl(path);
  }

  private buildGallery(
    product: Producto
  ): string[] {
    const additionalImages = [
      ...(product.imagenes ?? [])
    ]
      .filter(image => image.activo)
      .sort(
        (first, second) =>
          first.orden - second.orden
      )
      .map(image => image.urlImagen);

    const images = [
      product.imagenPrincipalUrl,
      ...additionalImages
    ]
      .filter(
        (value): value is string =>
          Boolean(value?.trim())
      )
      .map(image => this.imageUrl(image));

    return [...new Set(images)];
  }
}
