import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { finalize } from 'rxjs';
import { DialogoSistemaService } from '../../../compartido/servicios/dialogo-sistema.service';
import { getHttpErrorMessage } from '../../../core/utils/http-error';
import { Categoria } from '../../../shared/models/domain.models';
import { CategoriaRequest, CategoryService } from '../../../shared/services/category.service';

@Component({
  selector: 'app-categorias-gestion',
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias-gestion.html',
  styleUrl: './categorias-gestion.scss'
})
export class CategoriasGestion implements OnInit {
  categorias: Categoria[] = [];
  terminoBusqueda = '';
  filtroEstado = 'TODOS';
  modalAbierto = false;
  modoEdicion = false;
  categoriaEditandoId?: string;
  cargando = false;
  guardando = false;
  formulario: CategoriaRequest = this.crearFormularioVacio();

  constructor(
    private readonly categoriasService: CategoryService,
    private readonly dialogo: DialogoSistemaService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.cargando = true;
    this.cdr.detectChanges();

    this.categoriasService.getAdmin('', 0, 100)
      .pipe(
        finalize(() => {
          this.cargando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: page => {
          this.categorias = [...page.content];
          this.cdr.detectChanges();
        },
        error: error => {
          this.categorias = [];
          this.cdr.detectChanges();
          void this.mostrarError(
            'No se pudieron cargar las categorías',
            getHttpErrorMessage(error)
          );
        }
      });
  }

  get categoriasFiltradas(): Categoria[] {
    const termino = this.terminoBusqueda.trim().toLowerCase();
    return this.categorias.filter(categoria => {
      const coincideBusqueda = !termino
        || categoria.nombre.toLowerCase().includes(termino)
        || (categoria.descripcion ?? '').toLowerCase().includes(termino);
      const coincideEstado = this.filtroEstado === 'TODOS'
        || (this.filtroEstado === 'ACTIVOS' && categoria.activo)
        || (this.filtroEstado === 'INACTIVOS' && !categoria.activo);
      return coincideBusqueda && coincideEstado;
    });
  }

  abrirNuevaCategoria(): void {
    this.modoEdicion = false;
    this.categoriaEditandoId = undefined;
    this.formulario = this.crearFormularioVacio();
    this.modalAbierto = true;
    this.cdr.detectChanges();
  }

  abrirEditarCategoria(categoria: Categoria): void {
    this.modoEdicion = true;
    this.categoriaEditandoId = categoria.idCategoria;
    this.formulario = {
      nombre: categoria.nombre,
      descripcion: categoria.descripcion ?? '',
      activo: categoria.activo
    };
    this.modalAbierto = true;
    this.cdr.detectChanges();
  }

  async guardarCategoria(form?: NgForm): Promise<void> {
    if (!(await this.validarFormulario(form)) || this.guardando) return;

    this.guardando = true;
    this.cdr.detectChanges();

    const request: CategoriaRequest = {
      nombre: this.formulario.nombre.trim().replace(/\s+/g, ' '),
      descripcion: this.formulario.descripcion?.trim() || null,
      activo: this.formulario.activo
    };

    const operation = this.modoEdicion && this.categoriaEditandoId
      ? this.categoriasService.update(this.categoriaEditandoId, request)
      : this.categoriasService.create(request);

    operation
      .pipe(
        finalize(() => {
          this.guardando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: categoria => {
          this.cerrarModal();
          this.cargarCategorias();
          this.cdr.detectChanges();
          void this.dialogo.alerta({
            tipo: 'exito',
            titulo: 'Categoría guardada',
            mensaje: `La categoría "${categoria.nombre}" fue sincronizada con la base de datos.`,
            textoAceptar: 'Listo',
            icono: 'check_circle'
          });
        },
        error: error => {
          this.cdr.detectChanges();
          void this.mostrarError(
            'No se pudo guardar la categoría',
            getHttpErrorMessage(error)
          );
        }
      });
  }

  async cambiarEstado(categoria: Categoria): Promise<void> {
    const nuevoEstado = !categoria.activo;
    const confirmar = await this.dialogo.confirmar({
      tipo: 'confirmacion',
      titulo: `${nuevoEstado ? 'Activar' : 'Desactivar'} categoría`,
      mensaje: `¿Deseas ${nuevoEstado ? 'activar' : 'desactivar'} "${categoria.nombre}"?`,
      textoAceptar: 'Sí, continuar',
      textoCancelar: 'Cancelar',
      icono: nuevoEstado ? 'visibility' : 'visibility_off'
    });

    if (!confirmar) return;

    this.categoriasService.changeStatus(categoria.idCategoria, nuevoEstado).subscribe({
      next: () => this.cargarCategorias(),
      error: error => {
        this.cdr.detectChanges();
        void this.mostrarError('No se pudo cambiar el estado', getHttpErrorMessage(error));
      }
    });
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.modoEdicion = false;
    this.categoriaEditandoId = undefined;
    this.formulario = this.crearFormularioVacio();
    this.cdr.detectChanges();
  }

  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.filtroEstado = 'TODOS';
    this.cdr.detectChanges();
  }

  private async validarFormulario(form?: NgForm): Promise<boolean> {
    const nombre = this.formulario.nombre.trim();
    const descripcion = this.formulario.descripcion?.trim() ?? '';
    if (form?.invalid) form.control.markAllAsTouched();
    if (nombre.length < 3 || nombre.length > 100) {
      await this.mostrarError('Nombre inválido', 'El nombre debe tener entre 3 y 100 caracteres.');
      return false;
    }
    if (descripcion.length > 2000) {
      await this.mostrarError('Descripción inválida', 'La descripción debe tener máximo 2000 caracteres.');
      return false;
    }
    return true;
  }

  private async mostrarError(titulo: string, mensaje: string): Promise<void> {
    await this.dialogo.alerta({
      tipo: 'error', titulo, mensaje,
      textoAceptar: 'Entendido', icono: 'error'
    });
  }

  private crearFormularioVacio(): CategoriaRequest {
    return { nombre: '', descripcion: '', activo: true };
  }
}
