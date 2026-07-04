import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { getHttpErrorMessage } from '../../../core/utils/http-error';
import { Dashboard } from '../../../shared/models/domain.models';
import { DashboardService } from '../../../shared/services/dashboard.service';
import { DialogoSistemaService } from '../../../compartido/servicios/dialogo-sistema.service';

interface TarjetaResumen {
  titulo: string;
  cantidad: number;
  descripcion: string;
  icono: string;
  ruta: string;
}

@Component({
  selector: 'app-inicio-gestion',
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio-gestion.html',
  styleUrl: './inicio-gestion.scss'
})
export class InicioGestion implements OnInit {
  tarjetas: TarjetaResumen[] = [];
  actividades = [
    { icono: 'cloud_sync', titulo: 'Sistema sincronizado', detalle: 'El panel consume la API y PostgreSQL.', fecha: 'Ahora' },
    { icono: 'security', titulo: 'Acceso protegido', detalle: 'Las rutas administrativas usan JWT.', fecha: 'Sesión actual' }
  ];
  contactoConfigurado = false;
  cargando = true;

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly dialogo: DialogoSistemaService,
      private readonly cdr: ChangeDetectorRef
  ) {}

ngOnInit(): void {
  this.cargando = true;
  this.cdr.markForCheck();

  this.dashboardService.get().subscribe({
    next: data => {
      this.contactoConfigurado = data.contactoConfigurado;
      this.tarjetas = this.construirTarjetas(data);
      this.cargando = false;

      this.cdr.markForCheck();
    },
    error: error => {
      this.cargando = false;
      this.cdr.markForCheck();

      void this.dialogo.alerta({
        tipo: 'error',
        titulo: 'No se pudo cargar el dashboard',
        mensaje: getHttpErrorMessage(error),
        textoAceptar: 'Entendido',
        icono: 'error'
      });
    }
  });
}

  private construirTarjetas(data: Dashboard): TarjetaResumen[] {
    return [
      { titulo: 'Productos', cantidad: data.totalProductos, descripcion: `${data.productosActivos} publicados`, icono: 'inventory_2', ruta: '/portal-jmp/productos' },
      { titulo: 'Categorías', cantidad: data.totalCategorias, descripcion: 'Categorías registradas', icono: 'category', ruta: '/portal-jmp/categorias' },
      { titulo: 'Servicios', cantidad: data.serviciosActivos, descripcion: 'Servicios publicados', icono: 'engineering', ruta: '/portal-jmp/servicios' },
      { titulo: 'Certificaciones', cantidad: data.certificacionesActivas, descripcion: 'Certificaciones activas', icono: 'workspace_premium', ruta: '/portal-jmp/certificaciones' }
    ];
  }
}
