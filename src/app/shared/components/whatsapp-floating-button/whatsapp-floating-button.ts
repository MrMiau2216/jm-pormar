import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { Contacto } from '../../models/domain.models';
import { ContactService } from '../../services/contact.service';
import { logError } from '../../utils/app-logger.util';
import { abrirWhatsappDirecto, armarMensajeWhatsapp } from '../../utils/whatsapp.util';

@Component({
  selector: 'app-whatsapp-floating-button',
  imports: [CommonModule],
  templateUrl: './whatsapp-floating-button.html',
  styleUrl: './whatsapp-floating-button.scss'
})
export class WhatsappFloatingButton implements OnInit {

  private contact?: Contacto;

  constructor(private readonly contactService: ContactService) {}

  ngOnInit(): void {
    this.contactService.getPublic().subscribe({
      next: contact => { this.contact = contact; },
      error: () => { this.contact = undefined; }
    });
  }

  openWhatsapp(): void {
    try {
      const mensaje = armarMensajeWhatsapp([
        'Hola, buen día.',
        '',
        'Me gustaría comunicarme con un asesor de JM Pormar.',
        'Deseo recibir información sobre los productos y servicios que ofrecen.',
        '',
        'Quedo atento(a) a su respuesta.',
        'Muchas gracias.'
      ]);

      abrirWhatsappDirecto(this.contact?.whatsapp, mensaje);
    } catch (error) {
      logError('WHATSAPP', 'BOTON_FLOTANTE', error);
    }
  }
}
