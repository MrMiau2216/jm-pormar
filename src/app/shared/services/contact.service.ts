import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Observable,
  catchError,
  map,
  of,
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
import { abrirWhatsappDirecto } from '../utils/whatsapp.util';
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

  consultarRuc(ruc: string): Observable<{ razonSocial: string } | null> {
    return this.http
      .get<ApiResponse<{ ruc: string; razonSocial: string; estado: string; condicion: string; direccion: string }>>(
        apiUrl(`/api/public/contacto/consulta-ruc/${ruc}`)
      )
      .pipe(
        map(response => response.data),
        catchError(() => of(null))
      );
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

    this.getPublic()
      .pipe(take(1))
      .subscribe({
        next: contact => {
          if (!this.normalizeWhatsappNumber(contact.whatsapp)) {
            void this.sweetAlert.error(
              'WhatsApp no disponible',
              'No existe un número de WhatsApp válido en la configuración.'
            );
            return;
          }

          abrirWhatsappDirecto(contact.whatsapp, resolvedMessage);
        },
        error: () => {
          void this.sweetAlert.error(
            'WhatsApp no disponible',
            'No se pudo obtener el número de WhatsApp configurado.'
          );
        }
      });
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
}
