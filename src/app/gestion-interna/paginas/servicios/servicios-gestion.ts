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
  timeout
} from 'rxjs';

import { DialogoSistemaService } from '../../../compartido/servicios/dialogo-sistema.service';
import { assetUrl } from '../../../core/utils/api-url';
import { getHttpErrorMessage } from '../../../core/utils/http-error';
import { validateImageFile } from '../../../core/utils/validation';
import {
  Servicio,
  ServicioRequest
} from '../../../shared/models/domain.models';
import { FileService } from '../../../shared/services/file.service';
import { ServiceService } from '../../../shared/services/service.service';

@Component({
  selector: 'app-servicios-gestion',
  imports: [CommonModule, FormsModule],
  templateUrl: './servicios-gestion.html',
  styleUrl: './servicios-gestion.scss'
})
export class ServiciosGestion implements OnInit, OnDestroy {

  readonly maxImagenesDetalle = 3;

  servicios: Servicio[] = [];

  terminoBusqueda = '';
  filtroEstado = 'TODOS';

  modalAbierto = false;
  modoEdicion = false;

  servicioEditandoId?: string;
  servicioEditando?: Servicio;

  cargando = false;
  guardando = false;
  subiendoArchivo = false;

  formulario: ServicioRequest =
    this.crearFormularioVacio();

  archivoPrincipalPendiente?: File;
  vistaPrincipalPendiente?: string;

  archivosDetallePendientes: File[] = [];
  vistasDetallePendientes: string[] = [];

  constructor(
    private readonly serviciosService: ServiceService,
    private readonly archivosService: FileService,
    private readonly dialogo: DialogoSistemaService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarServicios();
  }

  ngOnDestroy(): void {
    this.liberarPrevisualizaciones();
  }

  cargarServicios(): void {
    this.cargando = true;
    this.refrescarVista();

    this.serviciosService
      .getAdmin('', undefined, 0, 100)
      .pipe(
        finalize(() => {
          this.cargando = false;
          this.refrescarVista();
        })
      )
      .subscribe({
        next: page => {
          this.servicios = [...page.content];

          if (this.servicioEditandoId) {
            this.servicioEditando =
              this.servicios.find(
                item =>
                  item.idServicio ===
                  this.servicioEditandoId
              );
          }

          this.refrescarVista();
        },
        error: error => {
          this.servicios = [];
          this.refrescarVista();

          void this.mostrarError(
            'No se pudieron cargar los servicios',
            getHttpErrorMessage(error)
          );
        }
      });
  }

  get serviciosFiltrados(): Servicio[] {
    const termino =
      this.terminoBusqueda.trim().toLowerCase();

    return this.servicios
      .filter(servicio => {
        const coincideBusqueda =
          !termino ||
          servicio.nombre
            .toLowerCase()
            .includes(termino) ||
          (servicio.proyectoRelacionado ?? '')
            .toLowerCase()
            .includes(termino) ||
          servicio.descripcionBreve
            .toLowerCase()
            .includes(termino);

        const coincideEstado =
          this.filtroEstado === 'TODOS' ||
          (
            this.filtroEstado === 'ACTIVOS' &&
            servicio.activo
          ) ||
          (
            this.filtroEstado === 'INACTIVOS' &&
            !servicio.activo
          );

        return coincideBusqueda && coincideEstado;
      })
      .sort(
        (a, b) =>
          a.nombre.localeCompare(b.nombre)
      );
  }

  get imagenPrincipalVista(): string | null {
    if (this.vistaPrincipalPendiente) {
      return this.vistaPrincipalPendiente;
    }

    return this.formulario.imagenPrincipalUrl
      ? this.resolverUrl(
          this.formulario.imagenPrincipalUrl
        )
      : null;
  }

  get imagenesDetalleRegistradas(): number {
    return (this.servicioEditando?.imagenes ?? [])
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
      this.totalImagenesDetalle <
        this.maxImagenesDetalle &&
      !this.guardando &&
      !this.subiendoArchivo
    );
  }

  abrirNuevoServicio(): void {
    this.prepararModal();

    this.modoEdicion = false;
    this.formulario = this.crearFormularioVacio();
    this.modalAbierto = true;

    this.refrescarVista();
  }

  abrirEditarServicio(servicio: Servicio): void {
    this.prepararModal();

    this.modoEdicion = true;
    this.servicioEditandoId = servicio.idServicio;
    this.servicioEditando = servicio;

    this.formulario = {
      nombre: servicio.nombre,
      proyectoRelacionado:
        servicio.proyectoRelacionado ?? '',
      descripcionBreve: servicio.descripcionBreve,
      descripcionCompleta:
        servicio.descripcionCompleta,
      imagenPrincipalUrl:
        servicio.imagenPrincipalUrl,
      activo: servicio.activo
    };

    this.modalAbierto = true;
    this.refrescarVista();
  }

  async guardarServicio(
    form?: NgForm
  ): Promise<void> {
    if (this.guardando) {
      return;
    }

    const formularioValido =
      await this.validarFormulario(form);

    if (!formularioValido) {
      return;
    }

    this.guardando = true;
    this.subiendoArchivo =
      Boolean(
        this.archivoPrincipalPendiente ||
        this.archivosDetallePendientes.length
      );

    this.refrescarVista();

    let servicioGuardado: Servicio | undefined;

    try {
      const imagenPrincipalUrl =
        await this.obtenerUrlImagenPrincipal();

      const request =
        this.crearRequest(imagenPrincipalUrl);

      const operacion =
        this.modoEdicion && this.servicioEditandoId
          ? this.serviciosService.update(
              this.servicioEditandoId,
              request
            )
          : this.serviciosService.create(request);

      servicioGuardado =
        await firstValueFrom(
          operacion.pipe(timeout(30000))
        );

      await this.cargarImagenesDetallePendientes(
        servicioGuardado
      );

      this.guardando = false;
      this.subiendoArchivo = false;

      this.cerrarModal(true);
      this.cargarServicios();
      this.refrescarVista();

      await this.dialogo.alerta({
        tipo: 'exito',
        titulo: 'Servicio guardado',
        mensaje:
          `El servicio "${servicioGuardado.nombre}" ` +
          'fue guardado correctamente.',
        textoAceptar: 'Listo',
        icono: 'check_circle'
      });

    } catch (error) {
      this.guardando = false;
      this.subiendoArchivo = false;

      if (servicioGuardado) {
        this.cerrarModal(true);
        this.cargarServicios();
      }

      this.refrescarVista();

      const mensaje = servicioGuardado
        ? 'El servicio fue guardado, pero no se ' +
          'pudieron completar todas sus imágenes. ' +
          getHttpErrorMessage(error)
        : getHttpErrorMessage(error);

      await this.mostrarError(
        'No se pudo guardar el servicio',
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

    const validationError =
      validateImageFile(file);

    if (validationError) {
      void this.mostrarError(
        'Archivo inválido',
        validationError
      );
      return;
    }

    if (this.vistaPrincipalPendiente) {
      URL.revokeObjectURL(
        this.vistaPrincipalPendiente
      );
    }

    this.archivoPrincipalPendiente = file;
    this.vistaPrincipalPendiente =
      URL.createObjectURL(file);

    this.refrescarVista();
  }

  quitarImagenPrincipalPendiente(): void {
    if (this.vistaPrincipalPendiente) {
      URL.revokeObjectURL(
        this.vistaPrincipalPendiente
      );
    }

    this.archivoPrincipalPendiente = undefined;
    this.vistaPrincipalPendiente = undefined;

    this.refrescarVista();
  }

  seleccionarImagenAdicional(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    input.value = '';

    if (!file) {
      return;
    }

    if (!this.puedeAgregarImagenDetalle) {
      void this.mostrarError(
        'Límite alcanzado',
        'Un servicio admite como máximo tres ' +
        'imágenes adicionales.'
      );
      return;
    }

    const validationError =
      validateImageFile(file);

    if (validationError) {
      void this.mostrarError(
        'Archivo inválido',
        validationError
      );
      return;
    }

    this.archivosDetallePendientes = [
      ...this.archivosDetallePendientes,
      file
    ];

    this.vistasDetallePendientes = [
      ...this.vistasDetallePendientes,
      URL.createObjectURL(file)
    ];

    this.refrescarVista();
  }

  quitarImagenDetallePendiente(
    index: number
  ): void {
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
    if (!this.servicioEditandoId || this.guardando) {
      return;
    }

    const confirmar =
      await this.dialogo.confirmar({
        tipo: 'confirmacion',
        titulo: 'Retirar imagen',
        mensaje:
          '¿Deseas retirar esta imagen del servicio?',
        textoAceptar: 'Sí, retirar',
        textoCancelar: 'Cancelar',
        icono: 'delete'
      });

    if (!confirmar) {
      return;
    }

    try {
      await firstValueFrom(
        this.serviciosService
          .removeImage(
            this.servicioEditandoId,
            idImagen
          )
          .pipe(timeout(30000))
      );

      await this.recargarServicioEditado();

    } catch (error) {
      await this.mostrarError(
        'No se pudo retirar la imagen',
        getHttpErrorMessage(error)
      );
    }
  }

  async cambiarEstado(
    servicio: Servicio
  ): Promise<void> {
    if (this.guardando) {
      return;
    }

    const nuevoEstado = !servicio.activo;

    const confirmar =
      await this.dialogo.confirmar({
        tipo: 'confirmacion',
        titulo:
          `${nuevoEstado ? 'Activar' : 'Desactivar'} servicio`,
        mensaje:
          `¿Deseas ${nuevoEstado ? 'activar' : 'desactivar'} ` +
          `"${servicio.nombre}"?`,
        textoAceptar: 'Sí, continuar',
        textoCancelar: 'Cancelar',
        icono: nuevoEstado
          ? 'visibility'
          : 'visibility_off'
      });

    if (!confirmar) {
      return;
    }

    this.guardando = true;
    this.refrescarVista();

    try {
      const actualizado =
        await firstValueFrom(
          this.serviciosService
            .changeStatus(
              servicio.idServicio,
              nuevoEstado
            )
            .pipe(timeout(30000))
        );

      this.servicios =
        this.servicios.map(item =>
          item.idServicio ===
          actualizado.idServicio
            ? actualizado
            : item
        );

    } catch (error) {
      await this.mostrarError(
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
    this.servicioEditandoId = undefined;
    this.servicioEditando = undefined;
    this.formulario = this.crearFormularioVacio();

    this.liberarPrevisualizaciones();
    this.refrescarVista();
  }

  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.filtroEstado = 'TODOS';

    this.refrescarVista();
  }

  resolverUrl(path?: string | null): string {
    return assetUrl(
      path,
      '/images/product-placeholder.svg'
    );
  }

  private prepararModal(): void {
    this.liberarPrevisualizaciones();

    this.servicioEditandoId = undefined;
    this.servicioEditando = undefined;
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

    console.log(
      'Subiendo imagen de servicio a Cloudinary:',
      this.archivoPrincipalPendiente.name
    );

    const archivo =
      await firstValueFrom(
        this.archivosService
          .upload(
            'servicios',
            this.archivoPrincipalPendiente
          )
          .pipe(timeout(30000))
      );

    console.log(
      'Respuesta Cloudinary servicios:',
      archivo
    );

    this.formulario.imagenPrincipalUrl =
      archivo.url;

    return archivo.url;
  }

  private crearRequest(
    imagenPrincipalUrl: string | null
  ): ServicioRequest {
    return {
      nombre:
        this.formulario.nombre
          .trim()
          .replace(/\s+/g, ' '),
      proyectoRelacionado:
        this.formulario
          .proyectoRelacionado
          ?.trim() ||
        null,
      descripcionBreve:
        this.formulario
          .descripcionBreve
          .trim(),
      descripcionCompleta:
        this.formulario
          .descripcionCompleta
          .trim(),
      imagenPrincipalUrl,
      activo: this.formulario.activo
    };
  }

  private async cargarImagenesDetallePendientes(
    servicio: Servicio
  ): Promise<void> {
    if (!this.archivosDetallePendientes.length) {
      return;
    }

    const cantidadExistente =
      (servicio.imagenes ?? [])
        .filter(imagen => imagen.activo)
        .length;

    for (
      let indice = 0;
      indice < this.archivosDetallePendientes.length;
      indice++
    ) {
      const archivoLocal =
        this.archivosDetallePendientes[indice];

      const subida =
        await firstValueFrom(
          this.archivosService
            .upload(
              'servicios',
              archivoLocal
            )
            .pipe(timeout(30000))
        );

      await firstValueFrom(
        this.serviciosService
          .addImage(
            servicio.idServicio,
            subida.url,
            cantidadExistente + indice + 1
          )
          .pipe(timeout(30000))
      );
    }
  }

  private async recargarServicioEditado():
    Promise<void> {

    if (!this.servicioEditandoId) {
      return;
    }

    const servicio =
      await firstValueFrom(
        this.serviciosService
          .getAdminById(this.servicioEditandoId)
          .pipe(timeout(30000))
      );

    this.servicioEditando = servicio;

    this.servicios =
      this.servicios.map(item =>
        item.idServicio === servicio.idServicio
          ? servicio
          : item
      );

    this.refrescarVista();
  }

  private async validarFormulario(
    form?: NgForm
  ): Promise<boolean> {
    form?.control.markAllAsTouched();

    const nombre =
      this.formulario.nombre.trim();

    if (
      nombre.length < 3 ||
      nombre.length > 150
    ) {
      await this.mostrarError(
        'Nombre inválido',
        'El nombre debe tener entre 3 y 150 caracteres.'
      );
      return false;
    }

    if (
      (
        this.formulario.proyectoRelacionado
          ?.length ?? 0
      ) > 180
    ) {
      await this.mostrarError(
        'Proyecto relacionado inválido',
        'El proyecto relacionado debe tener máximo 180 caracteres.'
      );
      return false;
    }

    if (
      !this.formulario.descripcionBreve.trim() ||
      this.formulario.descripcionBreve.length > 250
    ) {
      await this.mostrarError(
        'Descripción breve inválida',
        'La descripción breve es obligatoria y debe tener máximo 250 caracteres.'
      );
      return false;
    }

    if (
      !this.formulario.descripcionCompleta.trim() ||
      this.formulario.descripcionCompleta.length > 5000
    ) {
      await this.mostrarError(
        'Descripción completa inválida',
        'La descripción completa es obligatoria y debe tener máximo 5000 caracteres.'
      );
      return false;
    }

    if (
      this.formulario.activo &&
      !this.formulario.imagenPrincipalUrl &&
      !this.archivoPrincipalPendiente
    ) {
      await this.mostrarError(
        'Imagen obligatoria',
        'Carga una imagen principal antes de publicar el servicio.'
      );
      return false;
    }

    if (
      this.totalImagenesDetalle >
      this.maxImagenesDetalle
    ) {
      await this.mostrarError(
        'Demasiadas imágenes',
        'Solo se permiten tres imágenes adicionales por servicio.'
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

  private refrescarVista(): void {
    this.cdr.detectChanges();
  }

  private async mostrarError(
    titulo: string,
    mensaje: string
  ): Promise<void> {
    await this.dialogo.alerta({
      tipo: 'error',
      titulo,
      mensaje,
      textoAceptar: 'Entendido',
      icono: 'error'
    });
  }

  private crearFormularioVacio():
    ServicioRequest {
    return {
      nombre: '',
      proyectoRelacionado: '',
      descripcionBreve: '',
      descripcionCompleta: '',
      imagenPrincipalUrl: null,
      activo: true
    };
  }
}