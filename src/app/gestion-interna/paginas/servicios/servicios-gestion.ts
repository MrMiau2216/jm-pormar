import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { finalize } from 'rxjs';
import { assetUrl } from '../../../core/utils/api-url';
import { getHttpErrorMessage } from '../../../core/utils/http-error';
import { validateImageFile } from '../../../core/utils/validation';
import { Servicio, ServicioRequest } from '../../../shared/models/domain.models';
import { FileService } from '../../../shared/services/file.service';
import { ServiceService } from '../../../shared/services/service.service';
import { DialogoSistemaService } from '../../../compartido/servicios/dialogo-sistema.service';
import { AdminToastService } from '../../servicios/admin-toast.service';

@Component({
  selector: 'app-servicios-gestion',
  imports: [CommonModule, FormsModule],
  templateUrl: './servicios-gestion.html',
  styleUrl: './servicios-gestion.scss'
})
export class ServiciosGestion implements OnInit {
  servicios: Servicio[] = [];
  terminoBusqueda = '';
  filtroEstado = 'TODOS';
  modalAbierto = false;
  modoEdicion = false;
  servicioEditandoId?: string;
  cargando = false;
  guardando = false;
  subiendoArchivo = false;
  formulario: ServicioRequest = this.crearFormularioVacio();

  constructor(
    private readonly serviciosService: ServiceService,
    private readonly archivosService: FileService,
    private readonly dialogo: DialogoSistemaService,
    private readonly cdr: ChangeDetectorRef,
    private readonly toast: AdminToastService
  ) {}

  ngOnInit(): void { this.cargarServicios(); }

  cargarServicios(): void {
    this.cargando = true;
    this.cdr.detectChanges();

    this.serviciosService.getAdmin('', undefined, 0, 100)
      .pipe(
        finalize(() => {
          this.cargando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: page => {
          this.servicios = [...page.content];
          this.cdr.detectChanges();
        },
        error: error => {
          this.servicios = [];
          this.cdr.detectChanges();
          void this.mostrarError('No se pudieron cargar los servicios', getHttpErrorMessage(error));
        }
      });
  }

  get serviciosFiltrados(): Servicio[] {
    const termino = this.terminoBusqueda.trim().toLowerCase();
    return this.servicios.filter(servicio => {
      const coincideBusqueda = !termino || servicio.nombre.toLowerCase().includes(termino) || (servicio.proyectoRelacionado ?? '').toLowerCase().includes(termino) || servicio.descripcionBreve.toLowerCase().includes(termino);
      const coincideEstado = this.filtroEstado === 'TODOS' || (this.filtroEstado === 'ACTIVOS' && servicio.activo) || (this.filtroEstado === 'INACTIVOS' && !servicio.activo);
      return coincideBusqueda && coincideEstado;
    }).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  abrirNuevoServicio(): void {
    this.modoEdicion = false;
    this.servicioEditandoId = undefined;
    this.formulario = this.crearFormularioVacio();
    this.modalAbierto = true;
    this.cdr.detectChanges();
  }

  abrirEditarServicio(servicio: Servicio): void {
    this.modoEdicion = true;
    this.servicioEditandoId = servicio.idServicio;
    this.formulario = {
      nombre: servicio.nombre,
      proyectoRelacionado: servicio.proyectoRelacionado ?? '',
      descripcionBreve: servicio.descripcionBreve,
      descripcionCompleta: servicio.descripcionCompleta,
      imagenPrincipalUrl: servicio.imagenPrincipalUrl,
      activo: servicio.activo
    };
    this.modalAbierto = true;
    this.cdr.detectChanges();
  }

  async guardarServicio(form?: NgForm): Promise<void> {
    if (!(await this.validarFormulario(form))) return;
    this.guardando = true;
    this.cdr.detectChanges();
    const request: ServicioRequest = {
      nombre: this.formulario.nombre.trim().replace(/\s+/g, ' '),
      proyectoRelacionado: this.formulario.proyectoRelacionado?.trim() || null,
      descripcionBreve: this.formulario.descripcionBreve.trim(),
      descripcionCompleta: this.formulario.descripcionCompleta.trim(),
      imagenPrincipalUrl: this.formulario.imagenPrincipalUrl || null,
      activo: this.formulario.activo
    };
    const esEdicion = this.modoEdicion && this.servicioEditandoId;
    const operation = esEdicion
      ? this.serviciosService.update(this.servicioEditandoId!, request)
      : this.serviciosService.create(request);
    operation.subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModal();
        this.cargarServicios();
        this.toast.exito(esEdicion ? 'Servicio actualizado correctamente.' : 'Servicio agregado correctamente.');
        this.cdr.detectChanges();
      },
      error: () => {
        this.guardando = false;
        this.toast.error('No se pudo completar la acción.');
        this.cdr.detectChanges();
      }
    });
  }

  seleccionarImagenPrincipal(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) { void this.mostrarError('Archivo inválido', validationError); input.value = ''; return; }
    this.subiendoArchivo = true;
    this.cdr.detectChanges();
    this.archivosService.upload('servicios', file).subscribe({
      next: response => { this.formulario.imagenPrincipalUrl = response.url; this.subiendoArchivo = false; input.value = ''; this.cdr.detectChanges(); },
      error: error => { this.subiendoArchivo = false; input.value = ''; this.cdr.detectChanges(); void this.mostrarError('No se pudo cargar la imagen', getHttpErrorMessage(error)); }
    });
  }

  async cambiarEstado(servicio: Servicio): Promise<void> {
    const nuevoEstado = !servicio.activo;
    const confirmar = await this.dialogo.confirmar({ tipo: 'confirmacion', titulo: `${nuevoEstado ? 'Activar' : 'Desactivar'} servicio`, mensaje: `¿Deseas ${nuevoEstado ? 'activar' : 'desactivar'} "${servicio.nombre}"?`, textoAceptar: 'Sí, continuar', textoCancelar: 'Cancelar', icono: nuevoEstado ? 'visibility' : 'visibility_off' });
    if (!confirmar) return;
    this.serviciosService.changeStatus(servicio.idServicio, nuevoEstado).subscribe({
      next: () => {
        this.cargarServicios();
        this.toast[nuevoEstado ? 'exito' : 'aviso'](nuevoEstado ? 'Servicio habilitado correctamente.' : 'Servicio deshabilitado correctamente.');
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.error('No se pudo completar la acción.');
        this.cdr.detectChanges();
      }
    });
  }

  cerrarModal(): void { this.modalAbierto = false; this.modoEdicion = false; this.servicioEditandoId = undefined; this.formulario = this.crearFormularioVacio(); this.cdr.detectChanges(); }
  limpiarFiltros(): void { this.terminoBusqueda = ''; this.filtroEstado = 'TODOS'; this.cdr.detectChanges(); }
  resolverUrl(path?: string | null): string { return assetUrl(path, '/images/product-placeholder.svg'); }

  private async validarFormulario(form?: NgForm): Promise<boolean> {
    form?.control.markAllAsTouched();
    const nombre = this.formulario.nombre.trim();
    if (nombre.length < 3 || nombre.length > 150) { await this.mostrarError('Nombre inválido', 'El nombre debe tener entre 3 y 150 caracteres.'); return false; }
    if ((this.formulario.proyectoRelacionado?.length ?? 0) > 180) { await this.mostrarError('Proyecto relacionado inválido', 'El proyecto relacionado debe tener máximo 180 caracteres.'); return false; }
    if (!this.formulario.descripcionBreve.trim() || this.formulario.descripcionBreve.length > 250) { await this.mostrarError('Descripción breve inválida', 'La descripción breve es obligatoria y debe tener máximo 250 caracteres.'); return false; }
    if (!this.formulario.descripcionCompleta.trim() || this.formulario.descripcionCompleta.length > 5000) { await this.mostrarError('Descripción completa inválida', 'La descripción completa es obligatoria y debe tener máximo 5000 caracteres.'); return false; }
    return true;
  }

  private async mostrarError(titulo: string, mensaje: string): Promise<void> { await this.dialogo.alerta({ tipo: 'error', titulo, mensaje, textoAceptar: 'Entendido', icono: 'error' }); }
  private crearFormularioVacio(): ServicioRequest { return { nombre: '', proyectoRelacionado: '', descripcionBreve: '', descripcionCompleta: '', imagenPrincipalUrl: null, activo: true }; }
}
