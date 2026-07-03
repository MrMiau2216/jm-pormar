import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  CategoriaGestion,
  CategoriasGestionService
} from '../../servicios/categorias-gestion.service';

import { DialogoSistemaService } from '../../../compartido/servicios/dialogo-sistema.service';

@Component({
  selector: 'app-categorias-gestion',
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias-gestion.html',
  styleUrl: './categorias-gestion.scss'
})
export class CategoriasGestion implements OnInit {
  categorias: CategoriaGestion[] = [];

  terminoBusqueda = '';
  filtroEstado = 'TODOS';

  modalAbierto = false;
  modoEdicion = false;
  categoriaEditandoId?: string;

  formulario = this.crearFormularioVacio();

  constructor(
    private categoriasService: CategoriasGestionService,
    private dialogo: DialogoSistemaService
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.categorias = this.categoriasService.listar();
  }

  get categoriasFiltradas(): CategoriaGestion[] {
    const termino = this.terminoBusqueda.trim().toLowerCase();

    return this.categorias
      .filter(categoria => {
        const coincideBusqueda =
          !termino ||
          categoria.nombre.toLowerCase().includes(termino) ||
          categoria.descripcion.toLowerCase().includes(termino);

        const coincideEstado =
          this.filtroEstado === 'TODOS' ||
          (this.filtroEstado === 'ACTIVOS' && categoria.activo) ||
          (this.filtroEstado === 'INACTIVOS' && !categoria.activo);

        return coincideBusqueda && coincideEstado;
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  abrirNuevaCategoria(): void {
    this.modoEdicion = false;
    this.categoriaEditandoId = undefined;
    this.formulario = this.crearFormularioVacio();
    this.modalAbierto = true;
  }

  abrirEditarCategoria(categoria: CategoriaGestion): void {
    this.modoEdicion = true;
    this.categoriaEditandoId = categoria.idCategoria;

    this.formulario = {
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      activo: categoria.activo
    };

    this.modalAbierto = true;
  }

  async guardarCategoria(): Promise<void> {
    const formularioValido = await this.validarFormulario();

    if (!formularioValido) {
      return;
    }

    if (this.modoEdicion && this.categoriaEditandoId) {
      this.categoriasService.actualizar(this.categoriaEditandoId, this.formulario);
    } else {
      this.categoriasService.crear(this.formulario);
    }

    this.cargarCategorias();
    this.cerrarModal();

    await this.dialogo.alerta({
      tipo: 'exito',
      titulo: 'Categoría guardada',
      mensaje: 'La información de la categoría se guardó correctamente.',
      textoAceptar: 'Listo',
      icono: 'check_circle'
    });
  }

  async cambiarEstado(categoria: CategoriaGestion): Promise<void> {
    const accion = categoria.activo ? 'desactivar' : 'activar';

    const confirmar = await this.dialogo.confirmar({
      tipo: 'confirmacion',
      titulo: `${accion.charAt(0).toUpperCase() + accion.slice(1)} categoría`,
      mensaje: `¿Deseas ${accion} la categoría "${categoria.nombre}"?`,
      textoAceptar: 'Sí, continuar',
      textoCancelar: 'Cancelar',
      icono: categoria.activo ? 'visibility_off' : 'visibility'
    });

    if (!confirmar) {
      return;
    }

    this.categoriasService.cambiarEstado(categoria.idCategoria);
    this.cargarCategorias();

    await this.dialogo.alerta({
      tipo: 'exito',
      titulo: 'Cambio realizado',
      mensaje: `La categoría fue ${categoria.activo ? 'desactivada' : 'activada'} correctamente.`,
      textoAceptar: 'Listo',
      icono: 'check_circle'
    });
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.modoEdicion = false;
    this.categoriaEditandoId = undefined;
    this.formulario = this.crearFormularioVacio();
  }

  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.filtroEstado = 'TODOS';
  }

  private async validarFormulario(): Promise<boolean> {
    if (!this.formulario.nombre.trim()) {
      await this.mostrarError('Campo obligatorio', 'Ingresa el nombre de la categoría.');
      return false;
    }

    if (!this.formulario.descripcion.trim()) {
      await this.mostrarError('Campo obligatorio', 'Ingresa una descripción para la categoría.');
      return false;
    }

    const nombreDuplicado = this.categoriasService.existeNombre(
      this.formulario.nombre,
      this.categoriaEditandoId
    );

    if (nombreDuplicado) {
      await this.mostrarError(
        'Categoría duplicada',
        'Ya existe una categoría registrada con ese nombre.'
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
      descripcion: '',
      activo: true
    };
  }
}
