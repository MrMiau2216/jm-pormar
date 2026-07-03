import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { DialogoSistemaService } from '../../compartido/servicios/dialogo-sistema.service';
import { AutenticacionInternaService } from '../servicios/autenticacion-interna.service';

@Component({
  selector: 'app-plantilla-gestion',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './plantilla-gestion.html',
  styleUrl: './plantilla-gestion.scss'
})
export class PlantillaGestion implements OnInit {
  menuContraido = false;
  menuMovilAbierto = false;
  nombreUsuario = 'Administrador';

  opcionesMenu = [
    { texto: 'Dashboard', icono: 'dashboard', ruta: '/portal-jmp-1622/inicio' },
    { texto: 'Productos', icono: 'inventory_2', ruta: '/portal-jmp-1622/productos' },
    { texto: 'Categorías', icono: 'category', ruta: '/portal-jmp-1622/categorias' },
    { texto: 'Servicios', icono: 'engineering', ruta: '/portal-jmp-1622/servicios' },
    {
      texto: 'Certificaciones',
      icono: 'workspace_premium',
      ruta: '/portal-jmp-1622/certificaciones'
    },
    { texto: 'Contacto', icono: 'contact_phone', ruta: '/portal-jmp-1622/contacto' }
  ];

  constructor(
    private autenticacion: AutenticacionInternaService,
    private router: Router,
    private dialogo: DialogoSistemaService
  ) {}

  ngOnInit(): void {
    const sesion = this.autenticacion.obtenerSesion();

    if (sesion) {
      this.nombreUsuario = sesion.nombreCompleto;
    }
  }

  alternarMenu(): void {
    if (window.innerWidth <= 900) {
      this.menuMovilAbierto = !this.menuMovilAbierto;
      return;
    }

    this.menuContraido = !this.menuContraido;
  }

  cerrarMenuMovil(): void {
    this.menuMovilAbierto = false;
  }

  @HostListener('window:resize')
  alCambiarTamano(): void {
    if (window.innerWidth > 900) {
      this.menuMovilAbierto = false;
    }
  }

  async cerrarSesion(): Promise<void> {
    const confirmar = await this.dialogo.confirmar({
      tipo: 'confirmacion',
      titulo: 'Cerrar sesión',
      mensaje: '¿Deseas cerrar la sesión del panel interno?',
      textoAceptar: 'Sí, cerrar',
      textoCancelar: 'Cancelar',
      icono: 'logout'
    });

    if (!confirmar) {
      return;
    }

    this.autenticacion.cerrarSesion();
    this.router.navigateByUrl('/portal-jmp-1622/ingreso');
  }
}
