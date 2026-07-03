import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { COMPANY_INFO, buildWhatsappUrl } from '../../shared/data/company-info';
import { RucLookupService } from '../../shared/services/ruc-lookup.service';

interface ContactMethod {
  icon: string;
  title: string;
  value: string;
  detail: string;
}

@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class Contact {
  company = COMPANY_INFO;

  constructor(private rucLookupService: RucLookupService) {}

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

  rucMessage = '';
  rucSearching = false;

  onRucInput(): void {
    this.contactForm.ruc = this.contactForm.ruc.replace(/\D/g, '');

    if (this.contactForm.ruc.length < 11) {
      this.contactForm.razonSocial = '';
      this.rucMessage = '';
    }

    if (this.contactForm.ruc.length === 11) {
      this.searchRuc();
    }
  }

  searchRuc(): void {
    const ruc = this.contactForm.ruc.trim();

    if (!ruc) {
      this.contactForm.razonSocial = '';
      this.rucMessage = '';
      return;
    }

    if (ruc.length !== 11) {
      this.contactForm.razonSocial = '';
      this.rucMessage = 'El RUC debe tener 11 dígitos.';
      return;
    }

    this.rucSearching = true;
    this.rucMessage = 'Buscando razón social...';

    this.rucLookupService.searchByRuc(ruc).subscribe(result => {
      this.rucSearching = false;

      if (!result) {
        this.contactForm.razonSocial = '';
        this.rucMessage = 'No se encontró razón social para este RUC.';
        return;
      }

      this.contactForm.razonSocial = result.razonSocial;
      this.rucMessage = 'Razón social encontrada.';
    });
  }

  private validateContactForm(): boolean {
    if (!this.contactForm.nombre.trim()) {
      alert('Ingresa tu nombre completo.');
      return false;
    }

    if (!this.contactForm.telefono.trim()) {
      alert('Ingresa tu número de teléfono.');
      return false;
    }

    if (!this.contactForm.asunto.trim() && !this.contactForm.mensaje.trim()) {
      alert('Ingresa un asunto o mensaje.');
      return false;
    }

    if (this.contactForm.ruc && this.contactForm.ruc.length !== 11) {
      alert('El RUC debe tener 11 dígitos.');
      return false;
    }

    if (this.contactForm.ruc && !this.contactForm.razonSocial) {
      alert('Valida el RUC para obtener la razón social.');
      return false;
    }

    return true;
  }

  contactMethods: ContactMethod[] = [
    {
      icon: 'call',
      title: 'Teléfono',
      value: COMPANY_INFO.phoneDisplay,
      detail: 'Atención comercial directa'
    },
    {
      icon: 'mail',
      title: 'Correo electrónico',
      value: COMPANY_INFO.email,
      detail: 'Recepción de consultas empresariales'
    },
    {
      icon: 'location_on',
      title: 'Ubicación',
      value: COMPANY_INFO.location,
      detail: 'Atención a empresas, obras e instituciones'
    },
    {
      icon: 'schedule',
      title: 'Horario de atención',
      value: 'Lunes a sábado',
      detail: 'Atención previa coordinación'
    }
  ];

  sendContact(): void {
    if (!this.validateContactForm()) {
      return;
    }

    const message = `
Hola JM Pormar, buen día.

Quisiera realizar una consulta desde su página web.

DATOS DE CONTACTO
• Nombre: ${this.contactForm.nombre}
• Empresa / Institución: ${this.contactForm.empresa || 'No indicado'}
• RUC: ${this.contactForm.ruc || 'No indicado'}
• Razón social: ${this.contactForm.razonSocial || 'No indicada'}
• Teléfono: ${this.contactForm.telefono}
• Correo: ${this.contactForm.correo || 'No indicado'}

ASUNTO
${this.contactForm.asunto || 'No indicado'}

MENSAJE
${this.contactForm.mensaje || 'No indicado'}

Quedo atento a su respuesta.
Gracias.
`.trim();

    window.open(buildWhatsappUrl(message), '_blank');
  }

  openWhatsapp(): void {
    const message = 'Hola, deseo comunicarme con JM Pormar.';
    window.open(buildWhatsappUrl(message), '_blank');
  }
}
