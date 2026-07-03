import { Component } from '@angular/core';
import { buildWhatsappUrl } from '../../data/company-info';

@Component({
  selector: 'app-whatsapp-floating-button',
  imports: [],
  templateUrl: './whatsapp-floating-button.html',
  styleUrl: './whatsapp-floating-button.scss'
})
export class WhatsappFloatingButton {
  whatsappLink = buildWhatsappUrl(
    'Hola JM Pormar, buen día. Deseo solicitar información sobre sus productos y servicios.'
  );
}
