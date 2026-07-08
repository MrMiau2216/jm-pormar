import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { finalize } from 'rxjs';

import { SweetAlertService } from '../../../compartido/servicios/sweet-alert.service';
import { getHttpErrorMessage } from '../../../core/utils/http-error';
import { ContactoRequest } from '../../../shared/models/domain.models';
import { ContactService } from '../../../shared/services/contact.service';

@Component({
  selector: 'app-contacto-gestion',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './contacto-gestion.html',
  styleUrl: './contacto-gestion.scss'
})
export class ContactoGestion implements OnInit {

  formulario: ContactoRequest =
    this.crearFormularioVacio();

  cargando = true;
  guardando = false;
  consultandoRuc = false;

  constructor(
    private readonly contactoService: ContactService,
    private readonly sweetAlert: SweetAlertService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarConfiguracion();
  }

  onRucInput(): void {
    this.formulario.ruc = (
      this.formulario.ruc ?? ''
    )
      .replace(/\D/g, '')
      .slice(0, 11);

    if (this.formulario.ruc.length < 11) {
      this.formulario.razonSocial = '';
    }

    this.refrescarVista();
  }

  consultarRuc(): void {
    const ruc =
      this.formulario.ruc?.trim() ?? '';

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

    this.contactoService
      .consultarRuc(ruc)
      .pipe(
        finalize(() => {
          this.consultandoRuc = false;
          this.refrescarVista();
        })
      )
      .subscribe({
        next: resultado => {
          this.formulario.razonSocial =
            resultado.razonSocial?.trim() ?? '';

          if (
            !this.formulario.direccion?.trim() &&
            resultado.direccion?.trim()
          ) {
            this.formulario.direccion =
              resultado.direccion.trim();
          }

          this.sweetAlert.exito(
            'RUC encontrado',
            this.formulario.razonSocial ||
              'La consulta se realizó correctamente.'
          );

          this.refrescarVista();
        },
        error: error => {
          this.formulario.razonSocial = '';

          this.sweetAlert.error(
            'No se pudo consultar el RUC',
            getHttpErrorMessage(error)
          );

          this.refrescarVista();
        }
      });
  }

  cargarConfiguracion(): void {
    this.cargando = true;
    this.refrescarVista();

    this.contactoService
      .getAdmin()
      .pipe(
        finalize(() => {
          this.cargando = false;
          this.refrescarVista();
        })
      )
      .subscribe({
        next: contacto => {
          this.formulario = {
            whatsapp: contacto.whatsapp ?? '',
            correo: contacto.correo ?? '',
            direccion: contacto.direccion ?? '',
            horarioAtencion:
              contacto.horarioAtencion ?? '',
            ruc: contacto.ruc ?? '',
            razonSocial:
              contacto.razonSocial ?? ''
          };

          this.refrescarVista();
        },
        error: error => {
          this.sweetAlert.error(
            'No se pudo cargar el contacto',
            getHttpErrorMessage(error)
          );

          this.refrescarVista();
        }
      });
  }

  guardarConfiguracion(
    form?: NgForm
  ): void {
    this.limpiarSoloNumeros('whatsapp');
    this.limpiarSoloNumeros('ruc');

    if (!this.validarFormulario(form)) {
      return;
    }

    if (this.guardando) {
      return;
    }

    this.guardando = true;
    this.refrescarVista();

    const request: ContactoRequest = {
      whatsapp: this.formulario.whatsapp.trim(),
      correo: this.formulario.correo
        .trim()
        .toLowerCase(),
      direccion:
        this.formulario.direccion.trim(),
      horarioAtencion:
        this.formulario.horarioAtencion.trim(),
      ruc: this.formulario.ruc?.trim() ?? '',
      razonSocial:
        this.formulario.razonSocial?.trim() ?? ''
    };

    this.contactoService
      .save(request)
      .pipe(
        finalize(() => {
          this.guardando = false;
          this.refrescarVista();
        })
      )
      .subscribe({
        next: contacto => {
          this.formulario = {
            whatsapp: contacto.whatsapp ?? '',
            correo: contacto.correo ?? '',
            direccion: contacto.direccion ?? '',
            horarioAtencion:
              contacto.horarioAtencion ?? '',
            ruc: contacto.ruc ?? '',
            razonSocial:
              contacto.razonSocial ?? ''
          };

          this.sweetAlert.exito(
            'Configuración guardada',
            'La web pública y el dashboard ya utilizan estos datos.'
          );

          this.refrescarVista();
        },
        error: error => {
          this.sweetAlert.error(
            'No se pudo guardar la configuración',
            getHttpErrorMessage(error)
          );

          this.refrescarVista();
        }
      });
  }

  async recargarDesdeBase(): Promise<void> {
    const resultado =
      await this.sweetAlert.confirmar(
        '¿Recargar configuración?',
        'Se descartarán los cambios no guardados y se volverán a leer los datos de PostgreSQL.',
        'Sí, recargar',
        'Cancelar'
      );

    if (!resultado.isConfirmed) {
      return;
    }

    this.cargarConfiguracion();
  }

  abrirWhatsapp(): void {
    const numero = (
      this.formulario.whatsapp ?? ''
    ).replace(/\D/g, '');

    if (!numero) {
      this.sweetAlert.error(
        'WhatsApp no configurado',
        'No hay un número configurado.'
      );
      return;
    }

    const mensaje = encodeURIComponent(
      'Hola JM Pormar, este es un mensaje de prueba desde el panel administrativo.'
    );

    window.open(
      `https://wa.me/${numero}?text=${mensaje}`,
      '_blank',
      'noopener,noreferrer'
    );
  }

  limpiarSoloNumeros(
    campo: 'ruc' | 'whatsapp'
  ): void {
    this.formulario[campo] = (
      this.formulario[campo] ?? ''
    ).replace(/\D/g, '');
  }

  private validarFormulario(
    form?: NgForm
  ): boolean {
    form?.control.markAllAsTouched();

    const whatsapp =
      this.formulario.whatsapp.trim();

    if (!/^[0-9]{9,15}$/.test(whatsapp)) {
      this.sweetAlert.error(
        'WhatsApp inválido',
        'Debe contener entre 9 y 15 dígitos, incluyendo el código de país.'
      );
      return false;
    }

    const correo =
      this.formulario.correo.trim();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        correo
      ) ||
      correo.length > 150
    ) {
      this.sweetAlert.error(
        'Correo inválido',
        'Ingresa un correo válido de máximo 150 caracteres.'
      );
      return false;
    }

    const direccion =
      this.formulario.direccion.trim();

    if (
      direccion.length < 5 ||
      direccion.length > 250
    ) {
      this.sweetAlert.error(
        'Dirección inválida',
        'La dirección debe tener entre 5 y 250 caracteres.'
      );
      return false;
    }

    const horario =
      this.formulario.horarioAtencion.trim();

    if (
      horario.length < 5 ||
      horario.length > 180
    ) {
      this.sweetAlert.error(
        'Horario inválido',
        'El horario debe tener entre 5 y 180 caracteres.'
      );
      return false;
    }

    const ruc =
      this.formulario.ruc?.trim() ?? '';

    if (ruc && !/^\d{11}$/.test(ruc)) {
      this.sweetAlert.error(
        'RUC inválido',
        'El RUC debe tener exactamente 11 dígitos o quedar vacío.'
      );
      return false;
    }

    const razonSocial =
      this.formulario.razonSocial?.trim() ?? '';

    if (
      razonSocial.length > 200
    ) {
      this.sweetAlert.error(
        'Razón social inválida',
        'La razón social debe tener máximo 200 caracteres.'
      );
      return false;
    }

    if (ruc && !razonSocial) {
      this.sweetAlert.advertencia(
        'Razón social pendiente',
        'Consulta el RUC antes de guardar la configuración.'
      );
      return false;
    }

    return true;
  }

  private crearFormularioVacio():
    ContactoRequest {
    return {
      whatsapp: '',
      correo: '',
      direccion: '',
      horarioAtencion: '',
      ruc: '',
      razonSocial: ''
    };
  }

  private refrescarVista(): void {
    this.cdr.detectChanges();
  }
}
