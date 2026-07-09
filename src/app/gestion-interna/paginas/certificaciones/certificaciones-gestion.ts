import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { finalize } from 'rxjs';
import { assetUrl } from '../../../core/utils/api-url';
import { getHttpErrorMessage } from '../../../core/utils/http-error';
import { validateCertificationFile } from '../../../core/utils/validation';
import { Certificacion, CertificacionRequest, TipoArchivoCertificacion } from '../../../shared/models/domain.models';
import { CertificationService } from '../../../shared/services/certification.service';
import { FileService } from '../../../shared/services/file.service';
import { DialogoSistemaService } from '../../../compartido/servicios/dialogo-sistema.service';
import { AdminToastService } from '../../servicios/admin-toast.service';

@Component({
  selector: 'app-certificaciones-gestion',
  imports: [CommonModule, FormsModule],
  templateUrl: './certificaciones-gestion.html',
  styleUrl: './certificaciones-gestion.scss'
})
export class CertificacionesGestion implements OnInit {
  certificaciones: Certificacion[] = [];
  terminoBusqueda = '';
  filtroEstado = 'TODOS';
  filtroTipoArchivo = 'TODOS';
  modalAbierto = false;
  modoEdicion = false;
  certificacionEditandoId?: string;
  cargando = false;
  guardando = false;
  subiendoArchivo = false;
  formulario: CertificacionRequest = this.crearFormularioVacio();
  private readonly maxCertificaciones = 6;

  constructor(
    private readonly certificacionesService: CertificationService,
    private readonly archivosService: FileService,
    private readonly dialogo: DialogoSistemaService,
    private readonly cdr: ChangeDetectorRef,
    private readonly toast: AdminToastService
  ) {}

  ngOnInit(): void { this.cargarCertificaciones(); }

  cargarCertificaciones(): void {
    this.cargando = true;
    this.cdr.detectChanges();

    this.certificacionesService.getAdmin('', undefined, 0, 100)
      .pipe(
        finalize(() => {
          this.cargando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: page => {
          this.certificaciones = [...page.content];
          this.cdr.detectChanges();
        },
        error: error => {
          this.certificaciones = [];
          this.cdr.detectChanges();
          void this.mostrarError('No se pudieron cargar las certificaciones', getHttpErrorMessage(error));
        }
      });
  }

  get certificacionesFiltradas(): Certificacion[] {
    const termino = this.terminoBusqueda.trim().toLowerCase();
    return this.certificaciones.filter(item => {
      const coincideBusqueda = !termino || item.nombre.toLowerCase().includes(termino) || item.tipo.toLowerCase().includes(termino) || (item.descripcion ?? '').toLowerCase().includes(termino);
      const coincideEstado = this.filtroEstado === 'TODOS' || (this.filtroEstado === 'ACTIVOS' && item.activo) || (this.filtroEstado === 'INACTIVOS' && !item.activo);
      const coincideArchivo = this.filtroTipoArchivo === 'TODOS' || item.tipoArchivo === this.filtroTipoArchivo;
      return coincideBusqueda && coincideEstado && coincideArchivo;
    }).sort((a, b) => a.orden - b.orden);
  }

  abrirNuevaCertificacion(): void {
    if (this.certificaciones.length >= this.maxCertificaciones) {
      this.toast.aviso(`Ya se alcanzó el máximo de ${this.maxCertificaciones} certificaciones.`);
      return;
    }
    this.modoEdicion = false;
    this.certificacionEditandoId = undefined;
    this.formulario = this.crearFormularioVacio();
    this.modalAbierto = true;
    this.cdr.detectChanges();
  }

  abrirEditarCertificacion(certificacion: Certificacion): void {
    this.modoEdicion = true;
    this.certificacionEditandoId = certificacion.idCertificacion;
    this.formulario = { nombre: certificacion.nombre, tipo: certificacion.tipo, descripcion: certificacion.descripcion ?? '', archivoUrl: certificacion.archivoUrl, tipoArchivo: certificacion.tipoArchivo, orden: certificacion.orden, activo: certificacion.activo };
    this.modalAbierto = true;
    this.cdr.detectChanges();
  }

  async guardarCertificacion(form?: NgForm): Promise<void> {
    if (!(await this.validarFormulario(form))) return;
    this.guardando = true;
    this.cdr.detectChanges();
    const request: CertificacionRequest = {
      nombre: this.formulario.nombre.trim().replace(/\s+/g, ' '),
      tipo: this.formulario.tipo.trim().replace(/\s+/g, ' '),
      descripcion: this.formulario.descripcion?.trim() || null,
      archivoUrl: this.formulario.archivoUrl,
      tipoArchivo: this.formulario.tipoArchivo,
      orden: Number(this.formulario.orden),
      activo: this.formulario.activo
    };
    const esEdicion = this.modoEdicion && this.certificacionEditandoId;
    const operation = esEdicion
      ? this.certificacionesService.update(this.certificacionEditandoId!, request)
      : this.certificacionesService.create(request);
    operation.subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModal();
        this.cargarCertificaciones();
        this.toast.exito(esEdicion ? 'Certificación actualizada correctamente.' : 'Certificación agregada correctamente.');
        this.cdr.detectChanges();
      },
      error: () => {
        this.guardando = false;
        this.toast.error('No se pudo completar la acción.');
        this.cdr.detectChanges();
      }
    });
  }

  seleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const validationError = validateCertificationFile(file);
    if (validationError) { void this.mostrarError('Archivo inválido', validationError); input.value = ''; return; }
    this.subiendoArchivo = true;
    this.cdr.detectChanges();
    this.archivosService.upload('certificaciones', file).subscribe({
      next: response => {
        this.formulario.archivoUrl = response.url;
        this.formulario.tipoArchivo = response.contentType === 'application/pdf' ? 'PDF' : 'IMAGEN';
        this.subiendoArchivo = false;
        input.value = '';
        this.cdr.detectChanges();
      },
      error: error => { this.subiendoArchivo = false; input.value = ''; this.cdr.detectChanges(); void this.mostrarError('No se pudo cargar el archivo', getHttpErrorMessage(error)); }
    });
  }

  async cambiarEstado(certificacion: Certificacion): Promise<void> {
    const nuevoEstado = !certificacion.activo;
    const confirmar = await this.dialogo.confirmar({ tipo: 'confirmacion', titulo: `${nuevoEstado ? 'Activar' : 'Desactivar'} certificación`, mensaje: `¿Deseas ${nuevoEstado ? 'activar' : 'desactivar'} "${certificacion.nombre}"?`, textoAceptar: 'Sí, continuar', textoCancelar: 'Cancelar', icono: nuevoEstado ? 'visibility' : 'visibility_off' });
    if (!confirmar) return;
    this.certificacionesService.changeStatus(certificacion.idCertificacion, nuevoEstado).subscribe({
      next: () => {
        this.cargarCertificaciones();
        this.toast[nuevoEstado ? 'exito' : 'aviso'](nuevoEstado ? 'Certificación activada correctamente.' : 'Certificación desactivada correctamente.');
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.error('No se pudo completar la acción.');
        this.cdr.detectChanges();
      }
    });
  }

  verArchivo(certificacion: Certificacion): void { window.open(assetUrl(certificacion.archivoUrl), '_blank', 'noopener'); }
  cerrarModal(): void { this.modalAbierto = false; this.modoEdicion = false; this.certificacionEditandoId = undefined; this.formulario = this.crearFormularioVacio(); this.cdr.detectChanges(); }
  limpiarFiltros(): void { this.terminoBusqueda = ''; this.filtroEstado = 'TODOS'; this.filtroTipoArchivo = 'TODOS'; this.cdr.detectChanges(); }

  private async validarFormulario(form?: NgForm): Promise<boolean> {
    form?.control.markAllAsTouched();
    const nombre = this.formulario.nombre.trim();
    const tipo = this.formulario.tipo.trim();
    if (nombre.length < 3 || nombre.length > 150) { await this.mostrarError('Nombre inválido', 'El nombre debe tener entre 3 y 150 caracteres.'); return false; }
    if (tipo.length < 2 || tipo.length > 100) { await this.mostrarError('Tipo inválido', 'El tipo debe tener entre 2 y 100 caracteres.'); return false; }
    if ((this.formulario.descripcion?.length ?? 0) > 2000) { await this.mostrarError('Descripción inválida', 'La descripción debe tener máximo 2000 caracteres.'); return false; }
    if (!this.formulario.archivoUrl) { await this.mostrarError('Archivo obligatorio', 'Selecciona y carga un PDF o una imagen.'); return false; }
    if (this.formulario.orden < 1 || this.formulario.orden > 100) { await this.mostrarError('Orden inválido', 'El orden debe estar entre 1 y 100.'); return false; }
    return true;
  }

  private async mostrarError(titulo: string, mensaje: string): Promise<void> { await this.dialogo.alerta({ tipo: 'error', titulo, mensaje, textoAceptar: 'Entendido', icono: 'error' }); }
  private crearFormularioVacio(): CertificacionRequest { return { nombre: '', tipo: '', descripcion: '', archivoUrl: '', tipoArchivo: 'PDF' as TipoArchivoCertificacion, orden: 1, activo: true }; }
}
