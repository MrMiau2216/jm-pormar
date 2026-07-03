import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CategoriaGestion } from '../../servicios/categorias-gestion.service';

import {
  DisponibilidadProducto,
  ProductoGestion,
  ProductosGestionService
} from '../../servicios/productos-gestion.service';

import { DialogoSistemaService } from '../../../compartido/servicios/dialogo-sistema.service';

@Component({
  selector: 'app-productos-gestion',
  imports: [CommonModule, FormsModule],
  templateUrl: './productos-gestion.html',
  styleUrl: './productos-gestion.scss'
})
export class ProductosGestion implements OnInit {
  productos: ProductoGestion[] = [];
  categorias: CategoriaGestion[] = [];

  disponibilidades: DisponibilidadProducto[] = [
    'DISPONIBLE',
    'CONSULTAR',
    'NO_DISPONIBLE'
  ];

  terminoBusqueda = '';
  filtroCategoria = 'TODAS';
  filtroDisponibilidad = 'TODAS';
  filtroEstado = 'TODOS';

  modalAbierto = false;
  modoEdicion = false;
  productoEditandoId?: string;

  formulario = this.crearFormularioVacio();

  constructor(
    private productosService: ProductosGestionService,
    private dialogo: DialogoSistemaService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.productos = this.productosService.listar();
    this.categorias = this.productosService.listarCategoriasActivas();
  }

  get productosFiltrados(): ProductoGestion[] {
    const termino = this.terminoBusqueda.trim().toLowerCase();

    return this.productos.filter(producto => {
      const nombreCategoria = this.obtenerNombreCategoria(producto.idCategoria).toLowerCase();

      const coincideBusqueda =
        !termino ||
        producto.nombre.toLowerCase().includes(termino) ||
        producto.codigoSku.toLowerCase().includes(termino) ||
        nombreCategoria.includes(termino);

      const coincideCategoria =
        this.filtroCategoria === 'TODAS' ||
        producto.idCategoria === this.filtroCategoria;

      const coincideDisponibilidad =
        this.filtroDisponibilidad === 'TODAS' ||
        producto.disponibilidad === this.filtroDisponibilidad;

      const coincideEstado =
        this.filtroEstado === 'TODOS' ||
        (this.filtroEstado === 'ACTIVOS' && producto.activo) ||
        (this.filtroEstado === 'INACTIVOS' && !producto.activo);

      return (
        coincideBusqueda &&
        coincideCategoria &&
        coincideDisponibilidad &&
        coincideEstado
      );
    });
  }

  abrirNuevoProducto(): void {
    this.modoEdicion = false;
    this.productoEditandoId = undefined;
    this.formulario = this.crearFormularioVacio();
    this.modalAbierto = true;
  }

  abrirEditarProducto(producto: ProductoGestion): void {
    this.modoEdicion = true;
    this.productoEditandoId = producto.idProducto;

    this.formulario = {
      idCategoria: producto.idCategoria,
      codigoSku: producto.codigoSku,
      nombre: producto.nombre,
      disponibilidad: producto.disponibilidad,
      descripcionBreve: producto.descripcionBreve,
      descripcionCompleta: producto.descripcionCompleta,
      caracteristicas: producto.caracteristicas,
      especificacionesTecnicas: producto.especificacionesTecnicas,
      imagenPrincipalUrl: producto.imagenPrincipalUrl,
      activo: producto.activo
    };

    this.modalAbierto = true;
  }

  async guardarProducto(): Promise<void> {
    const formularioValido = await this.validarFormulario();

    if (!formularioValido) {
      return;
    }

    if (this.modoEdicion && this.productoEditandoId) {
      this.productosService.actualizar(this.productoEditandoId, this.formulario);
    } else {
      this.productosService.crear(this.formulario);
    }

    this.cargarDatos();
    this.cerrarModal();

    await this.dialogo.alerta({
      tipo: 'exito',
      titulo: 'Producto guardado',
      mensaje: 'La información del producto se guardó correctamente.',
      textoAceptar: 'Listo',
      icono: 'check_circle'
    });
  }

  async cambiarEstado(producto: ProductoGestion): Promise<void> {
    const accion = producto.activo ? 'desactivar' : 'activar';

    const confirmar = await this.dialogo.confirmar({
      tipo: 'confirmacion',
      titulo: `${accion.charAt(0).toUpperCase() + accion.slice(1)} producto`,
      mensaje: `¿Deseas ${accion} el producto "${producto.nombre}"?`,
      textoAceptar: 'Sí, continuar',
      textoCancelar: 'Cancelar',
      icono: producto.activo ? 'visibility_off' : 'visibility'
    });

    if (!confirmar) {
      return;
    }

    this.productosService.cambiarEstado(producto.idProducto);
    this.cargarDatos();

    await this.dialogo.alerta({
      tipo: 'exito',
      titulo: 'Cambio realizado',
      mensaje: `El producto fue ${producto.activo ? 'desactivado' : 'activado'} correctamente.`,
      textoAceptar: 'Listo',
      icono: 'check_circle'
    });
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.modoEdicion = false;
    this.productoEditandoId = undefined;
    this.formulario = this.crearFormularioVacio();
  }

  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.filtroCategoria = 'TODAS';
    this.filtroDisponibilidad = 'TODAS';
    this.filtroEstado = 'TODOS';
  }

  obtenerNombreCategoria(idCategoria: string): string {
    return this.productosService.obtenerNombreCategoria(idCategoria);
  }

  formatearDisponibilidad(disponibilidad: DisponibilidadProducto): string {
    const textos: Record<DisponibilidadProducto, string> = {
      DISPONIBLE: 'Disponible',
      CONSULTAR: 'Consultar',
      NO_DISPONIBLE: 'No disponible'
    };

    return textos[disponibilidad];
  }

  private async validarFormulario(): Promise<boolean> {
    if (!this.formulario.codigoSku.trim()) {
      await this.mostrarError('Campo obligatorio', 'Ingresa el código SKU del producto.');
      return false;
    }

    if (!this.formulario.nombre.trim()) {
      await this.mostrarError('Campo obligatorio', 'Ingresa el nombre del producto.');
      return false;
    }

    if (!this.formulario.idCategoria.trim()) {
      await this.mostrarError('Campo obligatorio', 'Selecciona una categoría.');
      return false;
    }

    if (!this.formulario.descripcionBreve.trim()) {
      await this.mostrarError('Campo obligatorio', 'Ingresa una descripción breve.');
      return false;
    }

    const codigoDuplicado = this.productosService.existeCodigoSku(
      this.formulario.codigoSku,
      this.productoEditandoId
    );

    if (codigoDuplicado) {
      await this.mostrarError(
        'Código duplicado',
        'Ya existe un producto registrado con ese código SKU.'
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
      idCategoria: '11111111-1111-1111-1111-111111111111',
      codigoSku: '',
      nombre: '',
      disponibilidad: 'DISPONIBLE' as DisponibilidadProducto,
      descripcionBreve: '',
      descripcionCompleta: '',
      caracteristicas: '',
      especificacionesTecnicas: '',
      imagenPrincipalUrl: '',
      activo: true
    };
  }
}
