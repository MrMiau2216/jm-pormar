import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  ServicioGestion,
  ServiciosGestionService
} from '../../servicios/servicios-gestion.service';

import { DialogoSistemaService } from '../../../compartido/servicios/dialogo-sistema.service';

@Component({
  selector: 'app-servicios-gestion',
  imports: [CommonModule, FormsModule],
  templateUrl: './servicios-gestion.html',
  styleUrl: './servicios-gestion.scss'
})
export class ServiciosGestion implements OnInit {
  servicios: ServicioGestion[] = [];

  terminoBusqueda = '';
  filtroEstado = 'TODOS';

  modalAbierto = false;
  modoEdicion = false;
  servicioEditandoId?: string;

  formulario = this.crearFormularioVacio();

  constructor(
    private serviciosService: ServiciosGestionService,
    private dialogo: DialogoSistemaService
  ) {}

  ngOnInit(): void {
    this.cargarServicios();
  }

  cargarServicios(): void {
    this.servicios = this.serviciosService.listar();
  }

  get serviciosFiltrados(): ServicioGestion[] {
    const termino = this.terminoBusqueda.trim().toLowerCase();

    return this.servicios
      .filter(servicio => {
        const coincideBusqueda =
          !termino ||
          servicio.nombre.toLowerCase().includes(termino) ||
          servicio.proyectoRelacionado.toLowerCase().includes(termino) ||
          servicio.descripcionBreve.toLowerCase().includes(termino);

        const coincideEstado =
          this.filtroEstado === 'TODOS' ||
          (this.filtroEstado === 'ACTIVOS' && servicio.activo) ||
          (this.filtroEstado === 'INACTIVOS' && !servicio.activo);

        return coincideBusqueda && coincideEstado;
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  abrirNuevoServicio(): void {
    this.modoEdicion = false;
    this.servicioEditandoId = undefined;
    this.formulario = this.crearFormularioVacio();
    this.modalAbierto = true;
  }

  abrirEditarServicio(servicio: ServicioGestion): void {
    this.modoEdicion = true;
    this.servicioEditandoId = servicio.idServicio;

    this.formulario = {
      nombre: servicio.nombre,
      proyectoRelacionado: servicio.proyectoRelacionado,
      descripcionBreve: servicio.descripcionBreve,
      descripcionCompleta: servicio.descripcionCompleta,
      imagenPrincipalUrl: servicio.imagenPrincipalUrl,
      activo: servicio.activo
    };

    this.modalAbierto = true;
  }

  async guardarServicio(): Promise<void> {
    const formularioValido = await this.validarFormulario();

    if (!formularioValido) {
      return;
    }

    if (this.modoEdicion && this.servicioEditandoId) {
      this.serviciosService.actualizar(this.servicioEditandoId, this.formulario);
    } else {
      this.serviciosService.crear(this.formulario);
    }

    this.cargarServicios();
    this.cerrarModal();

    await this.dialogo.alerta({
      tipo: 'exito',
      titulo: 'Servicio guardado',
      mensaje: 'La información del servicio se guardó correctamente.',
      textoAceptar: 'Listo',
      icono: 'check_circle'
    });
  }

  async cambiarEstado(servicio: ServicioGestion): Promise<void> {
    const accion = servicio.activo ? 'desactivar' : 'activar';

    const confirmar = await this.dialogo.confirmar({
      tipo: 'confirmacion',
      titulo: `${accion.charAt(0).toUpperCase() + accion.slice(1)} servicio`,
      mensaje: `¿Deseas ${accion} el servicio "${servicio.nombre}"?`,
      textoAceptar: 'Sí, continuar',
      textoCancelar: 'Cancelar',
      icono: servicio.activo ? 'visibility_off' : 'visibility'
    });

    if (!confirmar) {
      return;
    }

    this.serviciosService.cambiarEstado(servicio.idServicio);
    this.cargarServicios();

    await this.dialogo.alerta({
      tipo: 'exito',
      titulo: 'Cambio realizado',
      mensaje: `El servicio fue ${servicio.activo ? 'desactivado' : 'activado'} correctamente.`,
      textoAceptar: 'Listo',
      icono: 'check_circle'
    });
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.modoEdicion = false;
    this.servicioEditandoId = undefined;
    this.formulario = this.crearFormularioVacio();
  }

  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.filtroEstado = 'TODOS';
  }

  private async validarFormulario(): Promise<boolean> {
    if (!this.formulario.nombre.trim()) {
      await this.mostrarError('Campo obligatorio', 'Ingresa el nombre del servicio.');
      return false;
    }

    if (!this.formulario.proyectoRelacionado.trim()) {
      await this.mostrarError(
        'Campo obligatorio',
        'Ingresa el proyecto o uso relacionado del servicio.'
      );
      return false;
    }

    if (!this.formulario.descripcionBreve.trim()) {
      await this.mostrarError('Campo obligatorio', 'Ingresa una descripción breve.');
      return false;
    }

    const nombreDuplicado = this.serviciosService.existeNombre(
      this.formulario.nombre,
      this.servicioEditandoId
    );

    if (nombreDuplicado) {
      await this.mostrarError(
        'Servicio duplicado',
        'Ya existe un servicio registrado con ese nombre.'
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
      proyectoRelacionado: '',
      descripcionBreve: '',
      descripcionCompleta: '',
      imagenPrincipalUrl: '',
      activo: true
    };
  }
}
