import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import {
  finalize,
  firstValueFrom,
  forkJoin,
  timeout
} from 'rxjs';

import { SweetAlertService } from '../../../compartido/servicios/sweet-alert.service';
import { assetUrl } from '../../../core/utils/api-url';
import { getHttpErrorMessage } from '../../../core/utils/http-error';
import { validateImageFile } from '../../../core/utils/validation';
import {
  Categoria,
  DisponibilidadProducto,
  Producto,
  ProductoRequest
} from '../../../shared/models/domain.models';
import { CategoryService } from '../../../shared/services/category.service';
import { FileService } from '../../../shared/services/file.service';
import { ProductService } from '../../../shared/services/product.service';

@Component({
  selector: 'app-productos-gestion',
  imports: [CommonModule, FormsModule],
  templateUrl: './productos-gestion.html',
  styleUrl: './productos-gestion.scss'
})
export class ProductosGestion implements OnInit, OnDestroy {

  readonly maxImagenesDetalle = 3;

  productos: Producto[] = [];
  categorias: Categoria[] = [];
  disponibilidades: DisponibilidadProducto[] = [
    'DISPONIBLE',
    'NO_DISPONIBLE'
  ];

  terminoBusqueda = '';
  filtroCategoria = 'TODAS';
  filtroDisponibilidad = 'TODAS';
  filtroEstado = 'TODOS';

  modalAbierto = false;
  modoEdicion = false;
  productoEditandoId?: string;
  productoEditando?: Producto;

  cargando = false;
  guardando = false;
  subiendoArchivo = false;

  formulario: ProductoRequest = this.crearFormularioVacio();

  archivoPrincipalPendiente?: File;
  vistaPrincipalPendiente?: string;
  archivosDetallePendientes: File[] = [];
  vistasDetallePendientes: string[] = [];

  constructor(
    private readonly productosService: ProductService,
    private readonly categoriasService: CategoryService,
    private readonly archivosService: FileService,
    private readonly sweetAlert: SweetAlertService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.liberarPrevisualizaciones();
  }

cargarDatos(): void {
  if (this.cargando) {
    return;
  }

  this.cargando = true;
  this.refrescarVista();

  forkJoin({
    productos: this.productosService.getAdminProducts({
      page: 0,
      size: 20
    }),
    categorias: this.categoriasService.getAdmin('', 0, 100)
  })
    .pipe(
      timeout(15000),
      finalize(() => {
        this.cargando = false;
        this.refrescarVista();
      })
    )
    .subscribe({
      next: resultado => {
        this.productos = [...resultado.productos.content];
        this.categorias = [...resultado.categorias.content];

        if (this.productoEditandoId) {
          this.productoEditando = this.productos.find(
            item => item.idProducto === this.productoEditandoId
          );
        }

        this.refrescarVista();
      },
      error: error => {
        this.productos = [];
        this.categorias = [];

        this.sweetAlert.error(
          'No se pudo cargar el catálogo',
          getHttpErrorMessage(error)
        );

        this.refrescarVista();
      }
    });
}

  get productosFiltrados(): Producto[] {
    const termino = this.terminoBusqueda.trim().toLowerCase();

    return this.productos.filter(producto => {
      const coincideBusqueda =
        !termino ||
        producto.nombre.toLowerCase().includes(termino) ||
        producto.codigoSku.toLowerCase().includes(termino) ||
        producto.categoria.toLowerCase().includes(termino);

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

  get imagenPrincipalVista(): string | null {
    if (this.vistaPrincipalPendiente) {
      return this.vistaPrincipalPendiente;
    }

    return this.formulario.imagenPrincipalUrl
      ? this.resolverUrl(this.formulario.imagenPrincipalUrl)
      : null;
  }

  get imagenesDetalleRegistradas(): number {
    return (this.productoEditando?.imagenes ?? [])
      .filter(imagen => imagen.activo)
      .length;
  }

  get totalImagenesDetalle(): number {
    return (
      this.imagenesDetalleRegistradas +
      this.archivosDetallePendientes.length
    );
  }

  get puedeAgregarImagenDetalle(): boolean {
    return (
      this.totalImagenesDetalle < this.maxImagenesDetalle &&
      !this.guardando
    );
  }

  abrirNuevoProducto(): void {
    this.prepararModal();
    this.modoEdicion = false;
    this.formulario = this.crearFormularioVacio();
    this.modalAbierto = true;
    this.refrescarVista();
  }

  abrirEditarProducto(producto: Producto): void {
    this.prepararModal();

    this.modoEdicion = true;
    this.productoEditandoId = producto.idProducto;
    this.productoEditando = producto;

    this.formulario = {
      idCategoria: producto.idCategoria,
      codigoSku: producto.codigoSku,
      nombre: producto.nombre,
      disponibilidad: producto.disponibilidad,
      descripcionBreve: producto.descripcionBreve,
      descripcionCompleta: producto.descripcionCompleta,
      caracteristicas: producto.caracteristicas ?? '',
      especificacionesTecnicas:
        producto.especificacionesTecnicas ?? '',
      imagenPrincipalUrl: producto.imagenPrincipalUrl,
      activo: producto.activo
    };

    this.modalAbierto = true;
    this.refrescarVista();
  }

  async guardarProducto(form?: NgForm): Promise<void> {
    if (this.guardando) {
      return;
    }

    const formularioValido = await this.validarFormulario(form);

    if (!formularioValido) {
      return;
    }

    this.guardando = true;
    this.subiendoArchivo = Boolean(
      this.archivoPrincipalPendiente ||
      this.archivosDetallePendientes.length
    );
    this.refrescarVista();

    let productoGuardado: Producto | undefined;

    try {
      const imagenPrincipalUrl =
        await this.obtenerUrlImagenPrincipal();

      const request = this.crearRequest(imagenPrincipalUrl);

      const operacion =
        this.modoEdicion && this.productoEditandoId
          ? this.productosService.update(
              this.productoEditandoId,
              request
            )
          : this.productosService.create(request);

      productoGuardado = await firstValueFrom(
        operacion.pipe(timeout(30000))
      );

      const imagenesRegistradas =
        productoGuardado.imagenes ?? [];

      const cantidadDetalleFinal =
        imagenesRegistradas
          .filter(imagen => imagen.activo)
          .length +
        this.archivosDetallePendientes.length;

      const totalImagenesFinal =
        (imagenPrincipalUrl ? 1 : 0) +
        cantidadDetalleFinal;

      await this.cargarImagenesDetallePendientes(
        productoGuardado
      );

      this.guardando = false;
      this.subiendoArchivo = false;

      this.cerrarModal(true);
      this.cargarDatos();
      this.refrescarVista();

      this.sweetAlert.exito(
        'Producto guardado',
        `El producto "${productoGuardado.nombre}" se registró ` +
        `correctamente con ${totalImagenesFinal} imagen(es).`
      );
    } catch (error) {
      this.guardando = false;
      this.subiendoArchivo = false;

      if (productoGuardado) {
        this.cerrarModal(true);
        this.cargarDatos();
      }

      this.refrescarVista();

      const mensaje = productoGuardado
        ? 'El producto fue registrado, pero no se pudieron ' +
          'completar todas sus imágenes. Puedes editarlo y ' +
          'volver a cargarlas. ' +
          getHttpErrorMessage(error)
        : getHttpErrorMessage(error);

      this.sweetAlert.error(
        'No se pudo completar el registro',
        mensaje
      );
    } finally {
      this.guardando = false;
      this.subiendoArchivo = false;
      this.refrescarVista();
    }
  }

  seleccionarImagenPrincipal(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    input.value = '';

    if (!file) {
      return;
    }

    const validationError = validateImageFile(file);

    if (validationError) {
      this.sweetAlert.error(
        'Archivo inválido',
        validationError
      );
      return;
    }

    if (this.vistaPrincipalPendiente) {
      URL.revokeObjectURL(this.vistaPrincipalPendiente);
    }

    this.archivoPrincipalPendiente = file;
    this.vistaPrincipalPendiente =
      URL.createObjectURL(file);

    this.refrescarVista();
  }

  quitarImagenPrincipalPendiente(): void {
    if (this.vistaPrincipalPendiente) {
      URL.revokeObjectURL(this.vistaPrincipalPendiente);
    }

    this.archivoPrincipalPendiente = undefined;
    this.vistaPrincipalPendiente = undefined;

    this.refrescarVista();
  }

  seleccionarImagenesDetalle(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    input.value = '';

    if (!files.length) {
      return;
    }

    const disponibles =
      this.maxImagenesDetalle -
      this.totalImagenesDetalle;

    if (files.length > disponibles) {
      this.sweetAlert.advertencia(
        'Límite de imágenes',
        `Solo puedes agregar ${disponibles} imagen(es) más. ` +
        'El producto admite una imagen principal y hasta ' +
        'tres imágenes de detalle.'
      );
      return;
    }

    for (const file of files) {
      const validationError =
        validateImageFile(file);

      if (validationError) {
        this.sweetAlert.error(
          'Archivo inválido',
          `${file.name}: ${validationError}`
        );
        return;
      }
    }

    for (const file of files) {
      this.archivosDetallePendientes = [
        ...this.archivosDetallePendientes,
        file
      ];

      this.vistasDetallePendientes = [
        ...this.vistasDetallePendientes,
        URL.createObjectURL(file)
      ];
    }

    this.refrescarVista();
  }

  quitarImagenDetallePendiente(index: number): void {
    const preview =
      this.vistasDetallePendientes[index];

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    this.vistasDetallePendientes =
      this.vistasDetallePendientes.filter(
        (_, posicion) => posicion !== index
      );

    this.archivosDetallePendientes =
      this.archivosDetallePendientes.filter(
        (_, posicion) => posicion !== index
      );

    this.refrescarVista();
  }

  async eliminarImagenAdicional(
    idImagen: string
  ): Promise<void> {
    if (!this.productoEditandoId || this.guardando) {
      return;
    }

    const resultado =
      await this.sweetAlert.confirmar(
        '¿Retirar imagen?',
        'La imagen dejará de mostrarse en la galería ' +
        'del producto.',
        'Sí, retirar',
        'Cancelar'
      );

    if (!resultado.isConfirmed) {
      return;
    }

    try {
      await firstValueFrom(
        this.productosService
          .removeImage(
            this.productoEditandoId,
            idImagen
          )
          .pipe(timeout(30000))
      );

      await this.recargarProductoEditado();

      this.sweetAlert.toast(
        'Imagen retirada correctamente'
      );
    } catch (error) {
      this.sweetAlert.error(
        'No se pudo retirar la imagen',
        getHttpErrorMessage(error)
      );
    }
  }

async cambiarEstado(producto: Producto): Promise<void> {
  if (this.guardando) {
    return;
  }

  const nuevoEstado = !producto.activo;

  const resultado = await this.sweetAlert.confirmar(
    nuevoEstado
      ? '¿Activar producto?'
      : '¿Desactivar producto?',
    nuevoEstado
      ? `El producto "${producto.nombre}" aparecerá en la web pública.`
      : `El producto "${producto.nombre}" dejará de mostrarse en la web pública.`,
    nuevoEstado
      ? 'Sí, activar'
      : 'Sí, desactivar',
    'Cancelar'
  );

  if (!resultado.isConfirmed) {
    return;
  }

  this.guardando = true;
  this.refrescarVista();

  try {
    const productoActualizado = await firstValueFrom(
      this.productosService
        .changeStatus(
          producto.idProducto,
          nuevoEstado
        )
        .pipe(timeout(30000))
    );

    this.productos = this.productos.map(item =>
      item.idProducto === productoActualizado.idProducto
        ? productoActualizado
        : item
    );

    if (
      this.productoEditandoId ===
      productoActualizado.idProducto
    ) {
      this.productoEditando = productoActualizado;
    }

    this.sweetAlert.toast(
      nuevoEstado
        ? 'Producto activado correctamente'
        : 'Producto desactivado correctamente'
    );
  } catch (error) {
    this.sweetAlert.error(
      'No se pudo cambiar el estado',
      getHttpErrorMessage(error)
    );
  } finally {
    this.guardando = false;
    this.refrescarVista();
  }
}

  cerrarModal(forzar = false): void {
    if (this.guardando && !forzar) {
      return;
    }

    this.modalAbierto = false;
    this.modoEdicion = false;
    this.productoEditandoId = undefined;
    this.productoEditando = undefined;
    this.formulario = this.crearFormularioVacio();

    this.liberarPrevisualizaciones();
    this.refrescarVista();
  }

  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.filtroCategoria = 'TODAS';
    this.filtroDisponibilidad = 'TODAS';
    this.filtroEstado = 'TODOS';

    this.refrescarVista();
  }

  obtenerNombreCategoria(
    idCategoria: string
  ): string {
    return this.categorias.find(
      item => item.idCategoria === idCategoria
    )?.nombre ?? 'Sin categoría';
  }

  formatearDisponibilidad(
    disponibilidad: DisponibilidadProducto
  ): string {
    return disponibilidad === 'DISPONIBLE'
      ? 'Disponible'
      : 'No disponible';
  }

  resolverUrl(
    path?: string | null
  ): string {
    return assetUrl(path);
  }

  private prepararModal(): void {
    this.liberarPrevisualizaciones();

    this.productoEditandoId = undefined;
    this.productoEditando = undefined;
    this.guardando = false;
    this.subiendoArchivo = false;
  }

  private async obtenerUrlImagenPrincipal():
    Promise<string | null> {

    if (!this.archivoPrincipalPendiente) {
      return (
        this.formulario.imagenPrincipalUrl ||
        null
      );
    }

    const response = await firstValueFrom(
      this.archivosService
        .upload(
          'productos',
          this.archivoPrincipalPendiente
        )
        .pipe(timeout(30000))
    );

    return response.url;
  }

  private crearRequest(
    imagenPrincipalUrl: string | null
  ): ProductoRequest {
    return {
      idCategoria: this.formulario.idCategoria,
      codigoSku:
        this.formulario.codigoSku
          .trim()
          .toUpperCase(),
      nombre:
        this.formulario.nombre
          .trim()
          .replace(/\s+/g, ' '),
      disponibilidad:
        this.formulario.disponibilidad,
      descripcionBreve:
        this.formulario.descripcionBreve.trim(),
      descripcionCompleta:
        this.formulario.descripcionCompleta.trim(),
      caracteristicas:
        this.formulario.caracteristicas?.trim() ||
        null,
      especificacionesTecnicas:
        this.formulario
          .especificacionesTecnicas
          ?.trim() ||
        null,
      imagenPrincipalUrl,
      activo: this.formulario.activo
    };
  }

  private async cargarImagenesDetallePendientes(
    producto: Producto
  ): Promise<void> {
    if (!this.archivosDetallePendientes.length) {
      return;
    }

    const cantidadExistente =
      (producto.imagenes ?? [])
        .filter(imagen => imagen.activo)
        .length;

    for (
      let indice = 0;
      indice < this.archivosDetallePendientes.length;
      indice++
    ) {
      const archivo =
        this.archivosDetallePendientes[indice];

      const subida = await firstValueFrom(
        this.archivosService
          .upload('productos', archivo)
          .pipe(timeout(30000))
      );

      await firstValueFrom(
        this.productosService
          .addImage(
            producto.idProducto,
            subida.url,
            cantidadExistente + indice + 1
          )
          .pipe(timeout(30000))
      );
    }
  }

  private async recargarProductoEditado():
    Promise<void> {

    if (!this.productoEditandoId) {
      return;
    }

    const producto = await firstValueFrom(
      this.productosService
        .getAdminProduct(
          this.productoEditandoId
        )
        .pipe(timeout(30000))
    );

    this.productoEditando = producto;

    this.productos = this.productos.map(
      item =>
        item.idProducto === producto.idProducto
          ? producto
          : item
    );

    this.refrescarVista();
  }

  private async validarFormulario(
    form?: NgForm
  ): Promise<boolean> {
    form?.control.markAllAsTouched();

    if (!this.formulario.idCategoria) {
      this.sweetAlert.error(
        'Categoría obligatoria',
        'Selecciona una categoría.'
      );
      return false;
    }

    if (
      !/^[A-Za-z0-9._/-]{2,50}$/.test(
        this.formulario.codigoSku.trim()
      )
    ) {
      this.sweetAlert.error(
        'SKU inválido',
        'El SKU debe tener entre 2 y 50 caracteres ' +
        'y solo admite letras, números, punto, guion, ' +
        'guion bajo y barra.'
      );
      return false;
    }

    const nombre =
      this.formulario.nombre.trim();

    if (
      nombre.length < 3 ||
      nombre.length > 150
    ) {
      this.sweetAlert.error(
        'Nombre inválido',
        'El nombre debe tener entre 3 y 150 caracteres.'
      );
      return false;
    }

    const descripcionBreve =
      this.formulario.descripcionBreve.trim();

    if (
      !descripcionBreve ||
      descripcionBreve.length > 250
    ) {
      this.sweetAlert.error(
        'Descripción breve inválida',
        'La descripción breve es obligatoria y debe ' +
        'tener máximo 250 caracteres.'
      );
      return false;
    }

    const descripcionCompleta =
      this.formulario.descripcionCompleta.trim();

    if (
      !descripcionCompleta ||
      descripcionCompleta.length > 5000
    ) {
      this.sweetAlert.error(
        'Descripción completa inválida',
        'La descripción completa es obligatoria y debe ' +
        'tener máximo 5000 caracteres.'
      );
      return false;
    }

    if (
      (this.formulario.caracteristicas?.length ?? 0) >
        4000 ||
      (
        this.formulario
          .especificacionesTecnicas
          ?.length ?? 0
      ) > 4000
    ) {
      this.sweetAlert.error(
        'Información demasiado extensa',
        'Características y especificaciones admiten ' +
        'máximo 4000 caracteres.'
      );
      return false;
    }

    const categoria = this.categorias.find(
      item =>
        item.idCategoria ===
        this.formulario.idCategoria
    );

    if (
      this.formulario.activo &&
      !categoria?.activo
    ) {
      this.sweetAlert.error(
        'Categoría inactiva',
        'No se puede publicar un producto dentro de ' +
        'una categoría inactiva.'
      );
      return false;
    }

    if (
      this.formulario.activo &&
      !this.formulario.imagenPrincipalUrl &&
      !this.archivoPrincipalPendiente
    ) {
      this.sweetAlert.error(
        'Imagen obligatoria',
        'Carga una imagen principal antes de publicar ' +
        'el producto.'
      );
      return false;
    }

    if (
      this.totalImagenesDetalle >
      this.maxImagenesDetalle
    ) {
      this.sweetAlert.error(
        'Demasiadas imágenes',
        'Solo se permiten tres imágenes de detalle, ' +
        'además de la imagen principal.'
      );
      return false;
    }

    return true;
  }

  private liberarPrevisualizaciones(): void {
    if (this.vistaPrincipalPendiente) {
      URL.revokeObjectURL(
        this.vistaPrincipalPendiente
      );
    }

    this.vistasDetallePendientes.forEach(
      url => URL.revokeObjectURL(url)
    );

    this.archivoPrincipalPendiente = undefined;
    this.vistaPrincipalPendiente = undefined;
    this.archivosDetallePendientes = [];
    this.vistasDetallePendientes = [];
  }

  private crearFormularioVacio():
    ProductoRequest {
    const categoriaActiva =
      this.categorias.find(item => item.activo);

    return {
      idCategoria:
        categoriaActiva?.idCategoria ?? '',
      codigoSku: '',
      nombre: '',
      disponibilidad: 'DISPONIBLE',
      descripcionBreve: '',
      descripcionCompleta: '',
      caracteristicas: '',
      especificacionesTecnicas: '',
      imagenPrincipalUrl: null,
      activo: false
    };
  }

  private refrescarVista(): void {
    this.cdr.detectChanges();
  }
}
