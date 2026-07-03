import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  ConfiguracionContactoGestion,
  ContactoGestionService
} from '../../servicios/contacto-gestion.service';

import { DialogoSistemaService } from '../../../compartido/servicios/dialogo-sistema.service';

@Component({
  selector: 'app-contacto-gestion',
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto-gestion.html',
  styleUrl: './contacto-gestion.scss'
})
export class ContactoGestion implements OnInit {
  configuracion?: ConfiguracionContactoGestion;

  formulario = this.crearFormularioVacio();

  constructor(
    private contactoService: ContactoGestionService,
    private dialogo: DialogoSistemaService
  ) {}

  ngOnInit(): void {
    this.cargarConfiguracion();
  }

  cargarConfiguracion(): void {
    this.configuracion = this.contactoService.obtenerConfiguracion();

    this.formulario = {
      idConfiguracion: this.configuracion.idConfiguracion,
      whatsapp: this.configuracion.whatsapp,
      correo: this.configuracion.correo,
      direccion: this.configuracion.direccion,
      horarioAtencion: this.configuracion.horarioAtencion,
      ruc: this.configuracion.ruc,
      googleMapsUrl: this.configuracion.googleMapsUrl
    };
  }

  async guardarConfiguracion(): Promise<void> {
    const formularioValido = await this.validarFormulario();

    if (!formularioValido) {
      return;
    }

    this.configuracion = this.contactoService.actualizarConfiguracion(this.formulario);

    await this.dialogo.alerta({
      tipo: 'exito',
      titulo: 'Configuración guardada',
      mensaje: 'Los datos de contacto se guardaron correctamente.',
      textoAceptar: 'Listo',
      icono: 'check_circle'
    });
  }

  async restaurarDatosBase(): Promise<void> {
    const confirmar = await this.dialogo.confirmar({
      tipo: 'confirmacion',
      titulo: 'Restaurar datos base',
      mensaje: '¿Deseas restaurar los datos base de contacto? Se perderán los cambios actuales.',
      textoAceptar: 'Sí, restaurar',
      textoCancelar: 'Cancelar',
      icono: 'restart_alt'
    });

    if (!confirmar) {
      return;
    }

    this.configuracion = this.contactoService.restaurarConfiguracion();

    this.formulario = {
      idConfiguracion: this.configuracion.idConfiguracion,
      whatsapp: this.configuracion.whatsapp,
      correo: this.configuracion.correo,
      direccion: this.configuracion.direccion,
      horarioAtencion: this.configuracion.horarioAtencion,
      ruc: this.configuracion.ruc,
      googleMapsUrl: this.configuracion.googleMapsUrl
    };

    await this.dialogo.alerta({
      tipo: 'exito',
      titulo: 'Datos restaurados',
      mensaje: 'Se restauraron los datos base de contacto.',
      textoAceptar: 'Listo',
      icono: 'check_circle'
    });
  }

  async abrirWhatsapp(): Promise<void> {
    const numero = this.formulario.whatsapp.replace(/\D/g, '');

    if (!numero) {
      await this.mostrarError('WhatsApp no configurado', 'No hay número de WhatsApp configurado.');
      return;
    }

    window.open(`https://wa.me/${numero}`, '_blank');
  }

  async abrirMapa(): Promise<void> {
    if (!this.formulario.googleMapsUrl.trim()) {
      await this.mostrarError('Mapa no configurado', 'No hay enlace de Google Maps configurado.');
      return;
    }

    window.open(this.formulario.googleMapsUrl, '_blank');
  }

  limpiarSoloNumeros(campo: 'ruc' | 'whatsapp'): void {
    this.formulario[campo] = this.formulario[campo].replace(/\D/g, '');
  }

  private async validarFormulario(): Promise<boolean> {
    if (!this.formulario.whatsapp.trim()) {
      await this.mostrarError('Campo obligatorio', 'Ingresa el número de WhatsApp.');
      return false;
    }

    if (this.formulario.whatsapp.length < 9) {
      await this.mostrarError('WhatsApp inválido', 'El número de WhatsApp no parece válido.');
      return false;
    }

    if (!this.formulario.correo.trim()) {
      await this.mostrarError('Campo obligatorio', 'Ingresa el correo de contacto.');
      return false;
    }

    if (!this.correoValido(this.formulario.correo)) {
      await this.mostrarError('Correo inválido', 'Ingresa un correo válido.');
      return false;
    }

    if (!this.formulario.direccion.trim()) {
      await this.mostrarError('Campo obligatorio', 'Ingresa la dirección.');
      return false;
    }

    if (!this.formulario.horarioAtencion.trim()) {
      await this.mostrarError('Campo obligatorio', 'Ingresa el horario de atención.');
      return false;
    }

    if (!this.formulario.ruc.trim()) {
      await this.mostrarError('Campo obligatorio', 'Ingresa el RUC.');
      return false;
    }

    if (this.formulario.ruc.length !== 11) {
      await this.mostrarError('RUC inválido', 'El RUC debe tener 11 dígitos.');
      return false;
    }

    return true;
  }

  private correoValido(correo: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
  }

  private async mostrarError(titulo: string, mensaje: string): Promise<void> {
    await this.dialogo.alerta({
      tipo: 'error',
      titulo,
      mensaje,
      textoAceptar: 'Entendido',
      icono: 'error'
    });
  }

  private crearFormularioVacio() {
    return {
      idConfiguracion: 'config-1111-1111-1111-111111111111',
      whatsapp: '',
      correo: '',
      direccion: '',
      horarioAtencion: '',
      ruc: '',
      googleMapsUrl: ''
    };
  }
}
