import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Contacto } from '../../shared/models/domain.models';
import { ContactService } from '../../shared/services/contact.service';

interface ContactMethod { icon: string; title: string; value: string; detail: string; }

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
  contactMethods: ContactMethod[] = [];
  loading = true;
  errorMessage = '';
  formErrorMessage = '';

  contactForm = { nombre: '', empresa: '', razonSocial: '', ruc: '', telefono: '', correo: '', asunto: '', mensaje: '' };

  constructor(private readonly contactService: ContactService) {}

  ngOnInit(): void {
    this.contactService.getPublic().subscribe({
      next: contact => {
        this.contact = contact;
        this.contactMethods = [
          { icon: 'chat', title: 'WhatsApp', value: this.formatPhone(contact.whatsapp), detail: 'Atención comercial directa' },
          { icon: 'mail', title: 'Correo electrónico', value: contact.correo, detail: 'Recepción de consultas empresariales' },
          { icon: 'location_on', title: 'Dirección', value: contact.direccion, detail: 'Sede de atención de JM Pormar' },
          { icon: 'schedule', title: 'Horario de atención', value: contact.horarioAtencion, detail: 'Atención previa coordinación' }
        ];
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

    const message = `Hola JM Pormar, buen día.\n\nQuisiera realizar una consulta desde su página web.\n\nDATOS DE CONTACTO\n• Nombre: ${this.contactForm.nombre.trim()}\n• Empresa / Institución: ${this.contactForm.empresa.trim() || 'No indicado'}\n• RUC: ${this.contactForm.ruc || 'No indicado'}\n• Razón social: ${this.contactForm.razonSocial.trim() || 'No indicada'}\n• Teléfono: ${this.contactForm.telefono.trim()}\n• Correo: ${this.contactForm.correo.trim() || 'No indicado'}\n\nASUNTO\n${this.contactForm.asunto.trim() || 'No indicado'}\n\nMENSAJE\n${this.contactForm.mensaje.trim() || 'No indicado'}\n\nQuedo atento a su respuesta.\nGracias.`;
    this.contactService.openWhatsapp(message);
  }

  openWhatsapp(): void {
    this.contactService.openWhatsapp('Hola, deseo comunicarme con JM Pormar.');
  }

  private formatPhone(number: string): string {
    return number.startsWith('51') && number.length === 11
      ? `+51 ${number.slice(2, 5)} ${number.slice(5, 8)} ${number.slice(8)}`
      : number;
  }
}
