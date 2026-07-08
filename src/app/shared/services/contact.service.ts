import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Observable,
  map,
  shareReplay,
  take
} from 'rxjs';

import { SweetAlertService } from '../../compartido/servicios/sweet-alert.service';
import { apiUrl } from '../../core/utils/api-url';
import { ApiResponse } from '../models/api.models';
import {
  Contacto,
  ContactoRequest
} from '../models/domain.models';
import { QuoteService } from './quote.service';

@Injectable({ providedIn: 'root' })
export class ContactService {

  private cachedPublic$?: Observable<Contacto>;

  constructor(
    private readonly http: HttpClient,
    private readonly sweetAlert: SweetAlertService,
    private readonly quoteService: QuoteService
  ) {}

  getPublic(force = false): Observable<Contacto> {
    if (!this.cachedPublic$ || force) {
      this.cachedPublic$ = this.http
        .get<ApiResponse<Contacto>>(
          apiUrl('/api/public/contacto')
        )
        .pipe(
          map(response => response.data),
          shareReplay(1)
        );
    }

    return this.cachedPublic$;
  }

  getAdmin(): Observable<Contacto> {
    return this.http
      .get<ApiResponse<Contacto>>(
        apiUrl('/api/admin/contacto')
      )
      .pipe(
        map(response => response.data)
      );
  }

  save(request: ContactoRequest): Observable<Contacto> {
    return this.http
      .put<ApiResponse<Contacto>>(
        apiUrl('/api/admin/contacto'),
        request
      )
      .pipe(
        map(response => {
          this.cachedPublic$ = undefined;
          return response.data;
        })
      );
  }

  openWhatsapp(message = ''): void {
    const resolvedMessage = this.resolveMessage(message);

    // La pestaña se abre inmediatamente durante el clic para
    // evitar que el navegador la bloquee como ventana emergente.
    const whatsappWindow = window.open(
      'about:blank',
      '_blank'
    );

    if (whatsappWindow) {
      whatsappWindow.document.title =
        'Preparando pedido para WhatsApp';

      whatsappWindow.document.body.innerHTML = `
        <div style="font-family:Arial,sans-serif;padding:32px;text-align:center">
          <h2>Preparando tu pedido...</h2>
          <p>En unos segundos se abrirá WhatsApp Web.</p>
        </div>
      `;
    }

    this.getPublic()
      .pipe(take(1))
      .subscribe({
        next: contact => {
          const number = this.normalizeWhatsappNumber(
            contact.whatsapp
          );

          if (!number) {
            whatsappWindow?.close();

            void this.sweetAlert.error(
              'WhatsApp no disponible',
              'No existe un número de WhatsApp válido en la configuración.'
            );
            return;
          }

          const url = this.buildWhatsappUrl(
            number,
            resolvedMessage
          );

          if (
            whatsappWindow &&
            !whatsappWindow.closed
          ) {
            whatsappWindow.opener = null;
            whatsappWindow.location.href = url;
            return;
          }

          window.location.href = url;
        },
        error: () => {
          whatsappWindow?.close();

          void this.sweetAlert.error(
            'WhatsApp no disponible',
            'No se pudo obtener el número de WhatsApp configurado.'
          );
        }
      });
  }

buildWhatsappUrl(
  number: string,
  message: string
): string {
  const normalizedNumber =
    this.normalizeWhatsappNumber(number);

  const encodedMessage =
    encodeURIComponent(message);

  const isMobile =
    /Android|iPhone|iPad|iPod|Mobile/i.test(
      navigator.userAgent
    );

  if (isMobile) {
    return (
      `https://wa.me/${normalizedNumber}` +
      `?text=${encodedMessage}`
    );
  }

  return (
    `whatsapp://send` +
    `?phone=${normalizedNumber}` +
    `&text=${encodedMessage}`
  );
}

  private resolveMessage(message: string): string {
    const normalized = this.removeDuplicatedMessage(
      message.trim()
    );

    const genericMessages = [
      '',
      'Hola JM Pormar, buen día. Deseo solicitar información sobre sus productos y servicios.',
      'Hola, deseo solicitar información sobre sus productos y servicios.',
      'Hola, deseo comunicarme con JM Pormar.'
    ];

    if (
      this.quoteService.count > 0 &&
      genericMessages.includes(normalized)
    ) {
      return this.quoteService.buildWhatsappOrderMessage();
    }

    return normalized ||
      this.quoteService.buildWhatsappOrderMessage();
  }

  private removeDuplicatedMessage(message: string): string {
    if (!message) {
      return '';
    }

    const half = message.length / 2;

    if (
      Number.isInteger(half) &&
      message.slice(0, half) === message.slice(half)
    ) {
      return message.slice(0, half).trim();
    }

    return message;
  }

  private normalizeWhatsappNumber(
    number?: string | null
  ): string {
    const digits = (number ?? '')
      .replace(/\D/g, '');

    if (digits.length === 9) {
      return `51${digits}`;
    }

    return digits;
  }

  private isMobileDevice(): boolean {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(
      navigator.userAgent
    );
  }
consultarRuc(
  ruc: string
): Observable<ConsultaRucResponse> {
  return this.http
    .get<ApiResponse<ConsultaRucResponse>>(
      apiUrl(
        `/api/admin/contacto/consultar-ruc/${ruc}`
      )
    )
    .pipe(
      map(response => response.data)
    );
}
  
consultarRucPublico(
  ruc: string
): Observable<ConsultaRucResponse> {
  return this.http
    .get<ApiResponse<ConsultaRucResponse>>(
      apiUrl(
        `/api/public/contacto/consulta-ruc/${ruc}`
      )
    )
    .pipe(
      map(response => response.data)
    );
}
}


export interface ConsultaRucResponse {
  ruc: string;
  razonSocial: string;
  estado?: string | null;
  condicion?: string | null;
  direccion?: string | null;
}



