import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { SweetAlertService } from '../../../compartido/servicios/sweet-alert.service';
import { ContactService } from '../../services/contact.service';
import { QuoteService } from '../../services/quote.service';

@Component({
  selector: 'app-whatsapp-floating-button',
  imports: [CommonModule],
  templateUrl: './whatsapp-floating-button.html',
  styleUrl: './whatsapp-floating-button.scss'
})
export class WhatsappFloatingButton {

  private readonly contactService = inject(ContactService);
  private readonly quoteService = inject(QuoteService);
  private readonly sweetAlert = inject(SweetAlertService);

  private readonly quoteItems = toSignal(
    this.quoteService.items$,
    {
      initialValue: this.quoteService.items
    }
  );

  readonly quoteCount = computed(() =>
    this.quoteItems().reduce(
      (total, item) => total + item.quantity,
      0
    )
  );

  openWhatsapp(): void {
    const message =
      this.quoteService.buildWhatsappOrderMessage();

    if (this.quoteService.count === 0) {
      void this.sweetAlert.advertencia(
        'No hay productos seleccionados',
        'Agrega uno o más productos antes de enviar el pedido por WhatsApp.'
      );
      return;
    }

    this.contactService.openWhatsapp(message);
  }
}
