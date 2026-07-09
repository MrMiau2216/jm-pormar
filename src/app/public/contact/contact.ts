import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Contacto } from '../../shared/models/domain.models';
import { ContactService } from '../../shared/services/contact.service';
import { logError } from '../../shared/utils/app-logger.util';
import { abrirWhatsappDirecto, armarMensajeWhatsapp } from '../../shared/utils/whatsapp.util';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class Contact implements OnInit {
  readonly companyName = 'INVERSIONES JM PORMAR BIENES Y SERVICIOS E.I.R.L.';
  readonly shortName = 'JM Pormar';
  contact?: Contacto;
  loading = true;
  errorMessage = '';
  formErrorMessage = '';

  contactForm = { nombre: '', empresa: '', razonSocial: '', ruc: '', telefono: '', correo: '', asunto: '', mensaje: '' };
  private ultimoRucConsultado = '';

  constructor(private readonly contactService: ContactService) {}

  ngOnInit(): void {
    this.contactService.getPublic().subscribe({
      next: contact => {
        this.contact = contact;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar la configuración de contacto.';
        this.loading = false;
      }
    });
  }

  onlyDigits(): void {
    this.contactForm.ruc = this.contactForm.ruc.replace(/\D/g, '');

    if (this.contactForm.ruc.length !== 11) {
      this.contactForm.razonSocial = '';
      this.ultimoRucConsultado = '';
      return;
    }

    if (this.ultimoRucConsultado === this.contactForm.ruc) {
      return;
    }

    this.ultimoRucConsultado = this.contactForm.ruc;

    this.contactService.consultarRuc(this.contactForm.ruc).subscribe(result => {
      this.contactForm.razonSocial = result?.razonSocial || '';
    });
  }

  sendContact(formDirective: NgForm): void {
    this.formErrorMessage = '';
    this.onlyDigits();
    if (formDirective.invalid) {
      formDirective.control.markAllAsTouched();
      this.formErrorMessage = 'Corrige los campos marcados antes de enviar la consulta.';
      return;
    }
    if (!this.contactForm.asunto.trim() && !this.contactForm.mensaje.trim()) {
      this.formErrorMessage = 'Ingresa un asunto o un mensaje.';
      return;
    }

    const f = this.contactForm;

    try {
      const mensaje = armarMensajeWhatsapp([
        'Hola, buen día.',
        '',
        `Mi nombre es ${f.nombre.trim() || 'cliente interesado'}.`,
        f.razonSocial ? `Represento a: ${f.razonSocial.trim()}` : null,
        f.ruc ? `RUC: ${f.ruc}` : null,
        f.telefono ? `Teléfono de contacto: ${f.telefono.trim()}` : null,
        f.correo ? `Correo: ${f.correo.trim()}` : null,
        '',
        'MOTIVO DE CONSULTA',
        f.asunto ? f.asunto.trim() : 'Deseo realizar una consulta.',
        '',
        f.mensaje ? `DETALLE\n${f.mensaje.trim()}` : null,
        '',
        'Quedo atento(a) a su respuesta.',
        'Muchas gracias.'
      ]);

      abrirWhatsappDirecto(this.contact?.whatsapp, mensaje);
    } catch (error) {
      logError('CONTACTO', 'ENVIAR_WHATSAPP', error, f);
    }
  }

  openWhatsapp(): void {
    abrirWhatsappDirecto(this.contact?.whatsapp, 'Hola, deseo comunicarme con JM Pormar.');
  }
}
