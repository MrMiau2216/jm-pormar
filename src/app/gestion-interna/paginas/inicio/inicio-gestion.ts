import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CategoriasGestionService } from '../../servicios/categorias-gestion.service';
import { CertificacionesGestionService } from '../../servicios/certificaciones-gestion.service';
import { ProductosGestionService } from '../../servicios/productos-gestion.service';
import { ServiciosGestionService } from '../../servicios/servicios-gestion.service';

interface TarjetaResumen {
  titulo: string;
  cantidad: number;
  descripcion: string;
  icono: string;
  ruta: string;
}

interface ActividadReciente {
  icono: string;
  titulo: string;
  detalle: string;
  fecha: string;
}

@Component({
  selector: 'app-inicio-gestion',
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio-gestion.html',
  styleUrl: './inicio-gestion.scss'
})
export class InicioGestion implements OnInit {
  tarjetas: TarjetaResumen[] = [];

  actividades: ActividadReciente[] = [
    {
      icono: 'inventory_2',
      titulo: 'Catálogo actualizado',
      detalle: 'Los productos activos se muestran en la página pública.',
      fecha: 'Hoy'
    },
    {
      icono: 'category',
      titulo: 'Categorías disponibles',
      detalle: 'Las categorías organizan el catálogo de productos.',
      fecha: 'Hoy'
    },
    {
      icono: 'workspace_premium',
      titulo: 'Certificaciones configuradas',
      detalle: 'Los documentos institucionales activos están listos para mostrarse.',
      fecha: 'Reciente'
    }
  ];

  constructor(
    private productosService: ProductosGestionService,
    private categoriasService: CategoriasGestionService,
    private serviciosService: ServiciosGestionService,
    private certificacionesService: CertificacionesGestionService
  ) {}

  ngOnInit(): void {
    this.cargarResumen();
  }

  cargarResumen(): void {
    const productos = this.productosService.listar();
    const categorias = this.categoriasService.listar();
    const servicios = this.serviciosService.listar();
    const certificaciones = this.certificacionesService.listar();

    this.tarjetas = [
      {
        titulo: 'Total de productos',
        cantidad: productos.length,
        descripcion: 'Productos registrados',
        icono: 'inventory_2',
        ruta: '/portal-jmp-1622/productos'
      },
      {
        titulo: 'Productos activos',
        cantidad: productos.filter(producto => producto.activo).length,
        descripcion: 'Visibles en la web',
        icono: 'check_circle',
        ruta: '/portal-jmp-1622/productos'
      },
      {
        titulo: 'Categorías',
        cantidad: categorias.length,
        descripcion: 'Categorías creadas',
        icono: 'category',
        ruta: '/portal-jmp-1622/categorias'
      },
      {
        titulo: 'Servicios',
        cantidad: servicios.filter(servicio => servicio.activo).length,
        descripcion: 'Servicios publicados',
        icono: 'engineering',
        ruta: '/portal-jmp-1622/servicios'
      },
      {
        titulo: 'Certificaciones',
        cantidad: certificaciones.filter(certificacion => certificacion.activo).length,
        descripcion: 'Certificaciones activas',
        icono: 'workspace_premium',
        ruta: '/portal-jmp-1622/certificaciones'
      }
    ];
  }
}
