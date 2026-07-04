import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { QuoteItem } from '../../shared/models/domain.models';
import { ContactService } from '../../shared/services/contact.service';
import { QuoteService } from '../../shared/services/quote.service';
import { SweetAlertService } from '../../compartido/servicios/sweet-alert.service';

@Component({
  selector: 'app-quotation',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './quotation.html',
  styleUrl: './quotation.scss'
})
export class Quotation implements OnInit {
  items: QuoteItem[] = [];
  quoteForm = { nombre: '', empresa: '', razonSocial: '', ruc: '', telefono: '', detalle: '' };
  errorMessage = '';

  constructor(
    private readonly quoteService: QuoteService,
    private readonly contactService: ContactService,
    private readonly sweetAlert: SweetAlertService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.quoteService.items$.subscribe(items => { this.items = [...items]; this.cdr.detectChanges(); });
  }

  get totalProducts(): number { return this.items.length; }
  get totalUnits(): number { return this.items.reduce((total, item) => total + item.quantity, 0); }

  increaseQuantity(item: QuoteItem): void { this.quoteService.increase(item.id); }
  decreaseQuantity(item: QuoteItem): void { this.quoteService.decrease(item.id); }
  removeItem(itemId: string): void { this.quoteService.remove(itemId); }

  async clearQuote(): Promise<void> {
    const result = await this.sweetAlert.confirmar(
      '¿Limpiar cotización?',
      'Se retirarán todos los productos de la lista.',
      'Sí, limpiar',
      'Cancelar'
    );

    if (result.isConfirmed) {
      this.quoteService.clear();
      void this.sweetAlert.toast('Cotización limpiada', 'success');
    }
  }

  onlyDigits(field: 'ruc'): void {
    this.quoteForm[field] = this.quoteForm[field].replace(/\D/g, '');
  }

  sendByWhatsapp(formDirective: NgForm): void {
    this.errorMessage = '';
    this.onlyDigits('ruc');

    if (!this.items.length) {
      this.errorMessage =
        'Agrega al menos un producto a la cotización.';
      return;
    }

    if (formDirective.invalid) {
      formDirective.control.markAllAsTouched();
      this.errorMessage =
        'Corrige los campos marcados antes de enviar la cotización.';
      return;
    }

    const orderNumber = this.generateOrderNumber();
    const orderDate = this.formatOrderDate(new Date());

    const productList = this.items
      .map(
        (item, index) =>
          `${index + 1}. *Producto:* ${item.name}\n` +
          `   *Código:* ${item.code}\n` +
          `   *Categoría:* ${item.category}\n` +
          `   *Cantidad:* ${item.quantity}`
      )
      .join('\n\n');

    const message =
      `*PEDIDO N.° ${orderNumber}*\n` +
      `*Fecha:* ${orderDate}\n\n` +
      'Hola JM Pormar, buen día.\n\n' +
      '*DATOS DEL SOLICITANTE*\n' +
      `• *Nombre:* ${this.quoteForm.nombre.trim()}\n` +
      `• *Empresa / Institución:* ${
        this.quoteForm.empresa.trim() || 'No indicado'
      }\n` +
      `• *RUC:* ${this.quoteForm.ruc || 'No indicado'}\n` +
      `• *Razón social:* ${
        this.quoteForm.razonSocial.trim() || 'No indicada'
      }\n` +
      `• *Teléfono:* ${this.quoteForm.telefono.trim()}\n\n` +
      '*ESTOY INTERESADO EN:*\n' +
      `${productList}\n\n` +
      '*DETALLE DEL PEDIDO*\n' +
      `${
        this.quoteForm.detalle.trim() ||
        'Solicito información de precio, disponibilidad y tiempo de entrega.'
      }\n\n` +
      'Quedo atento a su confirmación. Gracias.';

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

}