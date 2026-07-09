import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Contacto, QuoteItem } from '../../shared/models/domain.models';
import { ContactService } from '../../shared/services/contact.service';
import { QuoteService } from '../../shared/services/quote.service';
import { SweetAlertService } from '../../compartido/servicios/sweet-alert.service';
import { logError } from '../../shared/utils/app-logger.util';
import { abrirWhatsappDirecto, armarMensajeWhatsapp } from '../../shared/utils/whatsapp.util';

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
  contact?: Contacto;
  private ultimoRucConsultado = '';

  constructor(
    private readonly quoteService: QuoteService,
    private readonly contactService: ContactService,
    private readonly sweetAlert: SweetAlertService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.quoteService.items$.subscribe(items => { this.items = [...items]; this.cdr.detectChanges(); });
    this.contactService.getPublic().subscribe({
      next: contact => { this.contact = contact; this.cdr.detectChanges(); },
      error: () => { this.contact = undefined; this.cdr.detectChanges(); }
    });
  }

  formatPhone(number: string): string {
    return number.startsWith('51') && number.length === 11
      ? `+51 ${number.slice(2, 5)} ${number.slice(5, 8)} ${number.slice(8)}`
      : number;
  }

  get totalProducts(): number { return this.items.length; }
  get totalUnits(): number { return this.items.reduce((total, item) => total + item.quantity, 0); }

  increaseQuantity(item: QuoteItem): void { this.quoteService.increase(item.id); }
  decreaseQuantity(item: QuoteItem): void { this.quoteService.decrease(item.id); }
async removeItem(
  item: QuoteItem
): Promise<void> {
  const result =
    await this.sweetAlert.confirmar(
      '¿Retirar producto?',
      `Se retirará "${item.name}" de la cotización.`,
      'Sí, retirar',
      'Cancelar'
    );

  if (!result.isConfirmed) {
    return;
  }

  this.quoteService.remove(item.id);

  void this.sweetAlert.toast(
    'Producto retirado',
    'success'
  );
}

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

    if (field !== 'ruc') {
      return;
    }

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

    const f = this.quoteForm;

    try {
      const productosTexto = this.items
        .map((item, index) => armarMensajeWhatsapp([
          `PRODUCTO ${index + 1}`,
          `Nombre: ${item.name}`,
          `Cantidad solicitada: ${item.quantity}`
        ]))
        .join('\n\n');

      const mensaje = armarMensajeWhatsapp([
        'Hola, buen día.',
        '',
        `Mi nombre es ${f.nombre.trim() || 'cliente interesado'}.`,
        f.razonSocial ? `Represento a: ${f.razonSocial.trim()}` : null,
        f.ruc ? `RUC: ${f.ruc}` : null,
        f.telefono ? `Teléfono de contacto: ${f.telefono.trim()}` : null,
        '',
        'SOLICITUD DE COTIZACIÓN',
        'Deseo solicitar una cotización para los siguientes productos:',
        '',
        productosTexto || null,
        '',
        f.detalle ? `DETALLE ADICIONAL\n${f.detalle.trim()}` : null,
        '',
        'Quedo atento(a) a su respuesta.',
        'Muchas gracias.'
      ]);

      abrirWhatsappDirecto(this.contact?.whatsapp, mensaje);

      this.quoteService.clear();
    } catch (error) {
      logError('COTIZACION', 'ENVIAR_WHATSAPP', error, { formulario: f, items: this.items });
    }
  }

}