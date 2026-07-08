import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { finalize } from 'rxjs';

import { SweetAlertService } from '../../compartido/servicios/sweet-alert.service';
import { getHttpErrorMessage } from '../../core/utils/http-error';
import { Contacto } from '../../shared/models/domain.models';
import { ContactService } from '../../shared/services/contact.service';

interface ContactMethod {
  icon: string;
  title: string;
  value: string;
  detail: string;
}

@Component({
  selector: 'app-contact',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class Contact implements OnInit {

  readonly companyName =
    'INVERSIONES JM PORMAR BIENES Y SERVICIOS E.I.R.L.';

  readonly shortName = 'JM Pormar';

  contact?: Contacto;
  contactMethods: ContactMethod[] = [];

  loading = true;
  consultandoRuc = false;

  errorMessage = '';
  formErrorMessage = '';

  contactForm = {
    nombre: '',
    empresa: '',
    razonSocial: '',
    ruc: '',
    telefono: '',
    correo: '',
    asunto: '',
    mensaje: ''
  };

  private rucConsultado = '';

  constructor(
    private readonly contactService: ContactService,
    private readonly sweetAlert: SweetAlertService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarContacto();
  }

  cargarContacto(): void {
    this.loading = true;
    this.errorMessage = '';
    this.refrescarVista();

    this.contactService
      .getPublic()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.refrescarVista();
        })
      )
      .subscribe({
        next: contact => {
          this.contact = contact;

          this.contactMethods = [
            {
              icon: 'chat',
              title: 'WhatsApp',
              value: this.formatPhone(contact.whatsapp),
              detail: 'Atención comercial directa'
            },
            {
              icon: 'mail',
              title: 'Correo electrónico',
              value: contact.correo,
              detail: 'Recepción de consultas empresariales'
            },
            {
              icon: 'location_on',
              title: 'Dirección',
              value: contact.direccion,
              detail: 'Sede de atención de JM Pormar'
            },
            {
              icon: 'schedule',
              title: 'Horario de atención',
              value: contact.horarioAtencion,
              detail: 'Atención previa coordinación'
            }
          ];

          this.refrescarVista();
        },
        error: error => {
          this.errorMessage =
            getHttpErrorMessage(error) ||
            'No se pudo cargar la configuración de contacto.';

          this.refrescarVista();
        }
      });
  }

  onRucInput(): void {
    const rucNormalizado = (
      this.contactForm.ruc ?? ''
    )
      .replace(/\D/g, '')
      .slice(0, 11);

    this.contactForm.ruc = rucNormalizado;

    if (rucNormalizado !== this.rucConsultado) {
      this.contactForm.razonSocial = '';
    }

    this.refrescarVista();
  }

  onTelefonoInput(): void {
    this.contactForm.telefono = (
      this.contactForm.telefono ?? ''
    )
      .replace(/\D/g, '')
      .slice(0, 15);
  }

  consultarRuc(): void {
    const ruc = this.contactForm.ruc.trim();

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
    this.refrescarVista();

    this.contactService
      .consultarRucPublico(ruc)
      .pipe(
        finalize(() => {
          this.consultandoRuc = false;
          this.refrescarVista();
        })
      )
      .subscribe({
        next: resultado => {
          const razonSocial =
            resultado.razonSocial?.trim() ?? '';

          if (!razonSocial) {
            this.rucConsultado = '';
            this.contactForm.razonSocial = '';

            this.sweetAlert.advertencia(
              'RUC sin razón social',
              'La consulta no devolvió una razón social.'
            );

            this.refrescarVista();
            return;
          }

          this.rucConsultado = ruc;
          this.contactForm.razonSocial = razonSocial;

          if (!this.contactForm.empresa.trim()) {
            this.contactForm.empresa = razonSocial;
          }

          this.sweetAlert.exito(
            'RUC encontrado',
            razonSocial
          );

          this.refrescarVista();
        },
        error: error => {
          this.rucConsultado = '';
          this.contactForm.razonSocial = '';

          this.sweetAlert.error(
            'No se pudo consultar el RUC',
            getHttpErrorMessage(error)
          );

          this.refrescarVista();
        }
      });
  }

  sendContact(
    formDirective: NgForm
  ): void {
    this.formErrorMessage = '';

    this.onRucInput();
    this.onTelefonoInput();

    if (formDirective.invalid) {
      formDirective.control.markAllAsTouched();

      this.formErrorMessage =
        'Corrige los campos marcados antes de enviar la consulta.';

      this.refrescarVista();
      return;
    }

    const ruc = this.contactForm.ruc.trim();

    if (ruc && !/^\d{11}$/.test(ruc)) {
      this.formErrorMessage =
        'El RUC debe contener exactamente 11 dígitos o quedar vacío.';

      this.refrescarVista();
      return;
    }

    if (
      !this.contactForm.asunto.trim() &&
      !this.contactForm.mensaje.trim()
    ) {
      this.formErrorMessage =
        'Ingresa un asunto o un mensaje.';

      this.refrescarVista();
      return;
    }

    const message =
      'Hola JM Pormar, buen día.\n\n' +
      'Quisiera realizar una consulta desde su página web.\n\n' +
      'DATOS DE CONTACTO\n' +
      `• Nombre: ${this.contactForm.nombre.trim()}\n` +
      `• Empresa / Institución: ${
        this.contactForm.empresa.trim() || 'No indicado'
      }\n` +
      `• RUC: ${
        this.contactForm.ruc || 'No indicado'
      }\n` +
      `• Razón social: ${
        this.contactForm.razonSocial.trim() || 'No indicada'
      }\n` +
      `• Teléfono: ${
        this.contactForm.telefono.trim()
      }\n` +
      `• Correo: ${
        this.contactForm.correo.trim() || 'No indicado'
      }\n\n` +
      'ASUNTO\n' +
      `${
        this.contactForm.asunto.trim() || 'No indicado'
      }\n\n` +
      'MENSAJE\n' +
      `${
        this.contactForm.mensaje.trim() || 'No indicado'
      }\n\n` +
      'Quedo atento a su respuesta.\n' +
      'Gracias.';

    this.contactService.openWhatsapp(message);
  }

  openWhatsapp(): void {
    this.contactService.openWhatsapp(
      'Hola, deseo comunicarme con JM Pormar.'
    );
  }

  private formatPhone(
    number: string
  ): string {
    const normalized = (
      number ?? ''
    ).replace(/\D/g, '');

    return normalized.startsWith('51') &&
      normalized.length === 11
      ? `+51 ${normalized.slice(2, 5)} ` +
          `${normalized.slice(5, 8)} ` +
          `${normalized.slice(8)}`
      : number;
  }

  private refrescarVista(): void {
    this.cdr.detectChanges();
  }
}
