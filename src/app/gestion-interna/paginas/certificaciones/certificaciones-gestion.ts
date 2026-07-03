import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  CertificacionGestion,
  CertificacionesGestionService,
  TipoArchivoCertificacion
} from '../../servicios/certificaciones-gestion.service';

import { DialogoSistemaService } from '../../../compartido/servicios/dialogo-sistema.service';

@Component({
  selector: 'app-certificaciones-gestion',
  imports: [CommonModule, FormsModule],
  templateUrl: './certificaciones-gestion.html',
  styleUrl: './certificaciones-gestion.scss'
})
export class CertificacionesGestion implements OnInit {
  certificaciones: CertificacionGestion[] = [];

  terminoBusqueda = '';
  filtroEstado = 'TODOS';
  filtroTipoArchivo = 'TODOS';

  modalAbierto = false;
  modoEdicion = false;
  certificacionEditandoId?: string;

  formulario = this.crearFormularioVacio();

  constructor(
    private certificacionesService: CertificacionesGestionService,
    private dialogo: DialogoSistemaService
  ) {}

  ngOnInit(): void {
    this.cargarCertificaciones();
  }

  cargarCertificaciones(): void {
    this.certificaciones = this.certificacionesService.listar();
  }

  get certificacionesFiltradas(): CertificacionGestion[] {
    const termino = this.terminoBusqueda.trim().toLowerCase();

    return this.certificaciones
      .filter(certificacion => {
        const coincideBusqueda =
          !termino ||
          certificacion.nombre.toLowerCase().includes(termino) ||
          certificacion.tipo.toLowerCase().includes(termino) ||
          certificacion.descripcion.toLowerCase().includes(termino);

        const coincideEstado =
          this.filtroEstado === 'TODOS' ||
          (this.filtroEstado === 'ACTIVOS' && certificacion.activo) ||
          (this.filtroEstado === 'INACTIVOS' && !certificacion.activo);

        const coincideTipoArchivo =
          this.filtroTipoArchivo === 'TODOS' ||
          certificacion.tipoArchivo === this.filtroTipoArchivo;

        return coincideBusqueda && coincideEstado && coincideTipoArchivo;
      })
      .sort((a, b) => a.orden - b.orden);
  }

  abrirNuevaCertificacion(): void {
    this.modoEdicion = false;
    this.certificacionEditandoId = undefined;
    this.formulario = this.crearFormularioVacio();
    this.modalAbierto = true;
  }

  abrirEditarCertificacion(certificacion: CertificacionGestion): void {
    this.modoEdicion = true;
    this.certificacionEditandoId = certificacion.idCertificacion;

    this.formulario = {
      nombre: certificacion.nombre,
      tipo: certificacion.tipo,
      descripcion: certificacion.descripcion,
      archivoUrl: certificacion.archivoUrl,
      tipoArchivo: certificacion.tipoArchivo,
      orden: certificacion.orden,
      activo: certificacion.activo
    };

    this.modalAbierto = true;
  }

  async guardarCertificacion(): Promise<void> {
    const formularioValido = await this.validarFormulario();

    if (!formularioValido) {
      return;
    }

    if (this.modoEdicion && this.certificacionEditandoId) {
      this.certificacionesService.actualizar(this.certificacionEditandoId, this.formulario);
    } else {
      this.certificacionesService.crear(this.formulario);
    }

    this.cargarCertificaciones();
    this.cerrarModal();

    await this.dialogo.alerta({
      tipo: 'exito',
      titulo: 'Certificación guardada',
      mensaje: 'La información de la certificación se guardó correctamente.',
      textoAceptar: 'Listo',
      icono: 'check_circle'
    });
  }

  async cambiarEstado(certificacion: CertificacionGestion): Promise<void> {
    const accion = certificacion.activo ? 'desactivar' : 'activar';

    const confirmar = await this.dialogo.confirmar({
      tipo: 'confirmacion',
      titulo: `${accion.charAt(0).toUpperCase() + accion.slice(1)} certificación`,
      mensaje: `¿Deseas ${accion} la certificación "${certificacion.nombre}"?`,
      textoAceptar: 'Sí, continuar',
      textoCancelar: 'Cancelar',
      icono: certificacion.activo ? 'visibility_off' : 'visibility'
    });

    if (!confirmar) {
      return;
    }

    this.certificacionesService.cambiarEstado(certificacion.idCertificacion);
    this.cargarCertificaciones();

    await this.dialogo.alerta({
      tipo: 'exito',
      titulo: 'Cambio realizado',
      mensaje: `La certificación fue ${certificacion.activo ? 'desactivada' : 'activada'} correctamente.`,
      textoAceptar: 'Listo',
      icono: 'check_circle'
    });
  }

  async verArchivo(certificacion: CertificacionGestion): Promise<void> {
    if (!certificacion.archivoUrl.trim()) {
      await this.dialogo.alerta({
        tipo: 'error',
        titulo: 'Archivo no configurado',
        mensaje: 'Esta certificación no tiene una ruta o URL de archivo registrada.',
        textoAceptar: 'Entendido',
        icono: 'error'
      });

      return;
    }

    window.open(certificacion.archivoUrl, '_blank');
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.modoEdicion = false;
    this.certificacionEditandoId = undefined;
    this.formulario = this.crearFormularioVacio();
  }

  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.filtroEstado = 'TODOS';
    this.filtroTipoArchivo = 'TODOS';
  }

  private async validarFormulario(): Promise<boolean> {
    if (!this.formulario.nombre.trim()) {
      await this.mostrarError('Campo obligatorio', 'Ingresa el nombre de la certificación.');
      return false;
    }

    if (!this.formulario.tipo.trim()) {
      await this.mostrarError('Campo obligatorio', 'Ingresa el tipo de certificación.');
      return false;
    }

    if (!this.formulario.descripcion.trim()) {
      await this.mostrarError('Campo obligatorio', 'Ingresa una descripción.');
      return false;
    }

    if (!this.formulario.archivoUrl.trim()) {
      await this.mostrarError('Campo obligatorio', 'Ingresa la URL o ruta del archivo.');
      return false;
    }

    if (this.formulario.orden < 1) {
      await this.mostrarError('Orden inválido', 'El orden debe ser mayor o igual a 1.');
      return false;
    }

    const nombreDuplicado = this.certificacionesService.existeNombre(
      this.formulario.nombre,
      this.certificacionEditandoId
    );

    if (nombreDuplicado) {
      await this.mostrarError(
        'Certificación duplicada',
        'Ya existe una certificación registrada con ese nombre.'
      );
      return false;
    }

    return true;
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
      nombre: '',
      tipo: '',
      descripcion: '',
      archivoUrl: '',
      tipoArchivo: 'PDF' as TipoArchivoCertificacion,
      orden: this.certificaciones.length + 1 || 1,
      activo: true
    };
  }
}
