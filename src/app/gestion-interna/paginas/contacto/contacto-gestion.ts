import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { getHttpErrorMessage } from '../../../core/utils/http-error';
import { ContactoRequest } from '../../../shared/models/domain.models';
import { ContactService } from '../../../shared/services/contact.service';
import { DialogoSistemaService } from '../../../compartido/servicios/dialogo-sistema.service';
import { AdminToastService } from '../../servicios/admin-toast.service';

@Component({
  selector: 'app-contacto-gestion',
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto-gestion.html',
  styleUrl: './contacto-gestion.scss'
})
export class ContactoGestion implements OnInit {
  formulario: ContactoRequest = this.crearFormularioVacio();
  cargando = true;
  guardando = false;

  constructor(
    private readonly contactoService: ContactService,
    private readonly dialogo: DialogoSistemaService,
    private readonly cdr: ChangeDetectorRef,
    private readonly toast: AdminToastService
  ) {}

  ngOnInit(): void { this.cargarConfiguracion(); }

  cargarConfiguracion(): void {
    this.cargando = true;
    this.contactoService.getAdmin().subscribe({
      next: contacto => {
        this.formulario = { whatsapp: contacto.whatsapp, correo: contacto.correo, direccion: contacto.direccion, horarioAtencion: contacto.horarioAtencion, ruc: contacto.ruc ?? '', razonSocial: contacto.razonSocial ?? '' };
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: async error => {
        this.cargando = false;
        this.cdr.detectChanges();
        await this.mostrarError('No se pudo cargar el contacto', getHttpErrorMessage(error));
      }
    });
  }

  async guardarConfiguracion(form?: NgForm): Promise<void> {
    this.limpiarSoloNumeros('whatsapp');
    this.limpiarSoloNumeros('ruc');
    if (!(await this.validarFormulario(form))) return;
    this.guardando = true;
    const request: ContactoRequest = { whatsapp: this.formulario.whatsapp, correo: this.formulario.correo.trim(), direccion: this.formulario.direccion.trim(), horarioAtencion: this.formulario.horarioAtencion.trim(), ruc: this.formulario.ruc, razonSocial: this.formulario.razonSocial.trim() };
    this.contactoService.save(request).subscribe({
      next: () => {
        this.guardando = false;
        this.toast.exito('Datos de contacto actualizados correctamente.');
        this.cdr.detectChanges();
      },
      error: () => {
        this.guardando = false;
        this.toast.error('No se pudieron guardar los datos de contacto.');
        this.cdr.detectChanges();
      }
    });
  }

  async recargarDesdeBase(): Promise<void> {
    const confirmar = await this.dialogo.confirmar({ tipo: 'confirmacion', titulo: 'Recargar configuración', mensaje: 'Se descartarán los cambios no guardados y se volverán a leer los datos de PostgreSQL.', textoAceptar: 'Sí, recargar', textoCancelar: 'Cancelar', icono: 'refresh' });
    if (confirmar) {
      this.cargarConfiguracion();
      this.toast.info('Datos recargados desde la base.');
    }
  }

  async abrirWhatsapp(): Promise<void> {
    const numero = this.formulario.whatsapp.replace(/\D/g, '');
    if (!numero) { await this.mostrarError('WhatsApp no configurado', 'No hay un número configurado.'); return; }
    window.open(`https://wa.me/${numero}`, '_blank', 'noopener');
  }

  limpiarSoloNumeros(campo: 'ruc' | 'whatsapp'): void { this.formulario[campo] = this.formulario[campo].replace(/\D/g, ''); }

  private async validarFormulario(form?: NgForm): Promise<boolean> {
    form?.control.markAllAsTouched();
    if (!/^[0-9]{9,15}$/.test(this.formulario.whatsapp)) { await this.mostrarError('WhatsApp inválido', 'Debe contener entre 9 y 15 dígitos, incluyendo el código de país.'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formulario.correo.trim()) || this.formulario.correo.length > 150) { await this.mostrarError('Correo inválido', 'Ingresa un correo válido de máximo 150 caracteres.'); return false; }
    if (this.formulario.direccion.trim().length < 5 || this.formulario.direccion.trim().length > 250) { await this.mostrarError('Dirección inválida', 'La dirección debe tener entre 5 y 250 caracteres.'); return false; }
    if (this.formulario.horarioAtencion.trim().length < 5 || this.formulario.horarioAtencion.trim().length > 180) { await this.mostrarError('Horario inválido', 'El horario debe tener entre 5 y 180 caracteres.'); return false; }
    if (this.formulario.ruc && !/^\d{11}$/.test(this.formulario.ruc)) { await this.mostrarError('RUC inválido', 'El RUC debe tener exactamente 11 dígitos o quedar vacío.'); return false; }
    return true;
  }

  private async mostrarError(titulo: string, mensaje: string): Promise<void> { await this.dialogo.alerta({ tipo: 'error', titulo, mensaje, textoAceptar: 'Entendido', icono: 'error' }); }
  private crearFormularioVacio(): ContactoRequest { return { whatsapp: '', correo: '', direccion: '', horarioAtencion: '', ruc: '', razonSocial: '' }; }
}
