import { Injectable } from '@angular/core';
import {
  CategoriaGestion,
  CategoriasGestionService
} from './categorias-gestion.service';

export type DisponibilidadProducto = 'DISPONIBLE' | 'CONSULTAR' | 'NO_DISPONIBLE';

export interface ProductoGestion {
  idProducto: string;
  idCategoria: string;
  codigoSku: string;
  nombre: string;
  disponibilidad: DisponibilidadProducto;
  descripcionBreve: string;
  descripcionCompleta: string;
  caracteristicas: string;
  especificacionesTecnicas: string;
  imagenPrincipalUrl: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

interface ProductoGestionAnterior {
  idProducto?: string | number;
  idCategoria?: string | number;
  id?: number;
  categoria?: string;
  codigoSku?: string;
  nombre?: string;
  disponibilidad?: DisponibilidadProducto;
  descripcionBreve?: string;
  descripcionCompleta?: string;
  caracteristicas?: string;
  especificacionesTecnicas?: string;
  imagenPrincipalUrl?: string;
  activo?: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosGestionService {
  private readonly claveStorage = 'jm_pormar_productos_gestion';

  private productosIniciales: ProductoGestion[] = [
    {
      idProducto: 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa',
      idCategoria: '11111111-1111-1111-1111-111111111111',
      codigoSku: 'MAT-001',
      nombre: 'Cemento Portland Tipo I',
      disponibilidad: 'DISPONIBLE',
      descripcionBreve: 'Cemento para obras civiles, acabados y trabajos generales.',
      descripcionCompleta: 'Producto utilizado en proyectos de construcción, remodelaciones y trabajos generales.',
      caracteristicas: 'Alta resistencia\nUso en construcción\nPresentación comercial',
      especificacionesTecnicas: 'Unidad: Bolsa\nUso: Construcción\nCondición: Nuevo',
      imagenPrincipalUrl: '/images/producto-cemento.jpg',
      activo: true,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    },
    {
      idProducto: 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb',
      idCategoria: '22222222-2222-2222-2222-222222222222',
      codigoSku: 'TUB-001',
      nombre: 'Tubo PVC Presión Clase 10',
      disponibilidad: 'CONSULTAR',
      descripcionBreve: 'Tubo PVC para instalaciones sanitarias y redes de agua.',
      descripcionCompleta: 'Producto orientado a instalaciones en obras, mantenimiento y abastecimiento técnico.',
      caracteristicas: 'Material PVC\nUso sanitario\nFácil instalación',
      especificacionesTecnicas: 'Unidad: Tubo\nMaterial: PVC\nCondición: Nuevo',
      imagenPrincipalUrl: '/images/producto-tubo-pvc.jpg',
      activo: true,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    },
    {
      idProducto: 'cccccccc-3333-3333-3333-cccccccccccc',
      idCategoria: '33333333-3333-3333-3333-333333333333',
      codigoSku: 'HER-001',
      nombre: 'Taladro Percutor Industrial',
      disponibilidad: 'DISPONIBLE',
      descripcionBreve: 'Herramienta eléctrica para perforación en obra y mantenimiento.',
      descripcionCompleta: 'Equipo de trabajo utilizado para perforaciones en distintos materiales según requerimiento.',
      caracteristicas: 'Uso industrial\nHerramienta eléctrica\nAlta durabilidad',
      especificacionesTecnicas: 'Unidad: Pieza\nUso: Perforación\nCondición: Nuevo',
      imagenPrincipalUrl: '/images/producto-taladro.jpg',
      activo: true,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    }
  ];

  constructor(private categoriasService: CategoriasGestionService) {}

  listarCategoriasActivas(): CategoriaGestion[] {
    return this.categoriasService.listarActivas();
  }

  listar(): ProductoGestion[] {
    const datos = localStorage.getItem(this.claveStorage);

    if (!datos) {
      this.guardarTodo(this.productosIniciales);
      return this.productosIniciales;
    }

    const productosGuardados = JSON.parse(datos) as ProductoGestionAnterior[];
    const productos = productosGuardados.map(producto => this.normalizarProducto(producto));

    if (productosGuardados.some(producto =>
      typeof producto.idProducto !== 'string' || typeof producto.idCategoria !== 'string'
    )) {
      this.guardarTodo(productos);
    }

    return productos;
  }

  crear(
    producto: Omit<ProductoGestion, 'idProducto' | 'fechaCreacion' | 'fechaActualizacion'>
  ): ProductoGestion {
    const productos = this.listar();

    const nuevoProducto: ProductoGestion = {
      ...producto,
      idProducto: this.generarUuid(),
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    };

    productos.push(nuevoProducto);
    this.guardarTodo(productos);

    return nuevoProducto;
  }

  actualizar(idProducto: string, productoActualizado: Partial<ProductoGestion>): void {
    const productos = this.listar();

    const productosActualizados = productos.map(producto => {
      if (producto.idProducto !== idProducto) {
        return producto;
      }

      return {
        ...producto,
        ...productoActualizado,
        fechaActualizacion: new Date().toISOString()
      };
    });

    this.guardarTodo(productosActualizados);
  }

  cambiarEstado(idProducto: string): void {
    const productos = this.listar();

    const productosActualizados = productos.map(producto => {
      if (producto.idProducto !== idProducto) {
        return producto;
      }

      return {
        ...producto,
        activo: !producto.activo,
        fechaActualizacion: new Date().toISOString()
      };
    });

    this.guardarTodo(productosActualizados);
  }

  existeCodigoSku(codigoSku: string, idProductoActual?: string): boolean {
    const codigoLimpio = codigoSku.trim().toLowerCase();

    return this.listar().some(producto =>
      producto.codigoSku.trim().toLowerCase() === codigoLimpio &&
      producto.idProducto !== idProductoActual
    );
  }

  obtenerNombreCategoria(idCategoria: string): string {
    const categoria = this.categoriasService
      .listar()
      .find(item => item.idCategoria === idCategoria);

    return categoria ? categoria.nombre : 'Sin categoría';
  }

  private normalizarProducto(producto: ProductoGestionAnterior): ProductoGestion {
    const fechaActual = new Date().toISOString();
    const productoBase = this.productosIniciales.find(
      item => item.codigoSku.toLowerCase() === producto.codigoSku?.toLowerCase()
    );

    return {
      idProducto: typeof producto.idProducto === 'string'
        ? producto.idProducto
        : productoBase?.idProducto ?? this.generarUuid(),
      idCategoria: this.normalizarIdCategoria(producto),
      codigoSku: producto.codigoSku ?? '',
      nombre: producto.nombre ?? '',
      disponibilidad: producto.disponibilidad ?? 'CONSULTAR',
      descripcionBreve: producto.descripcionBreve ?? '',
      descripcionCompleta: producto.descripcionCompleta ?? '',
      caracteristicas: producto.caracteristicas ?? '',
      especificacionesTecnicas: producto.especificacionesTecnicas ?? '',
      imagenPrincipalUrl: producto.imagenPrincipalUrl ?? '',
      activo: producto.activo ?? true,
      fechaCreacion: producto.fechaCreacion ?? fechaActual,
      fechaActualizacion: producto.fechaActualizacion ?? fechaActual
    };
  }

  private normalizarIdCategoria(producto: ProductoGestionAnterior): string {
    if (typeof producto.idCategoria === 'string') {
      return producto.idCategoria;
    }

    const categorias = this.categoriasService.listar();
    const categoriaPorIndice = typeof producto.idCategoria === 'number'
      ? categorias.find(categoria => categoria.idCategoria.startsWith(`${producto.idCategoria}`))
      : undefined;
    const categoriaPorNombre = categorias.find(
      categoria => categoria.nombre.toLowerCase() === producto.categoria?.toLowerCase()
    );
    const productoBase = this.productosIniciales.find(
      item => item.codigoSku.toLowerCase() === producto.codigoSku?.toLowerCase()
    );

    return categoriaPorIndice?.idCategoria
      ?? categoriaPorNombre?.idCategoria
      ?? productoBase?.idCategoria
      ?? categorias[0]?.idCategoria
      ?? '11111111-1111-1111-1111-111111111111';
  }

  private guardarTodo(productos: ProductoGestion[]): void {
    localStorage.setItem(this.claveStorage, JSON.stringify(productos));
  }

  private generarUuid(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, caracter => {
      const numero = Math.random() * 16 | 0;
      const valor = caracter === 'x' ? numero : (numero & 0x3 | 0x8);
      return valor.toString(16);
    });
  }
}
