import { Injectable } from '@angular/core';

export interface CategoriaGestion {
  idCategoria: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

interface CategoriaGestionAnterior extends Partial<CategoriaGestion> {
  id?: number;
  orden?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriasGestionService {
  private readonly claveStorage = 'jm_pormar_categorias_gestion';

  private categoriasIniciales: CategoriaGestion[] = [
    {
      idCategoria: '11111111-1111-1111-1111-111111111111',
      nombre: 'Materiales',
      descripcion: 'Materiales de construcción para obras civiles, remodelaciones y proyectos.',
      activo: true,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    },
    {
      idCategoria: '22222222-2222-2222-2222-222222222222',
      nombre: 'Tuberías',
      descripcion: 'Productos para instalaciones sanitarias, redes de agua y mantenimiento.',
      activo: true,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    },
    {
      idCategoria: '33333333-3333-3333-3333-333333333333',
      nombre: 'Herramientas',
      descripcion: 'Herramientas manuales y eléctricas para trabajos técnicos y operativos.',
      activo: true,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    },
    {
      idCategoria: '44444444-4444-4444-4444-444444444444',
      nombre: 'EPPS',
      descripcion: 'Equipos de protección personal para seguridad en obra y trabajos industriales.',
      activo: true,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    },
    {
      idCategoria: '55555555-5555-5555-5555-555555555555',
      nombre: 'Electricidad',
      descripcion: 'Materiales eléctricos para instalaciones, mantenimiento y abastecimiento.',
      activo: true,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    },
    {
      idCategoria: '66666666-6666-6666-6666-666666666666',
      nombre: 'Ferretería',
      descripcion: 'Artículos generales de ferretería para obras, empresas e instituciones.',
      activo: true,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    }
  ];

  listar(): CategoriaGestion[] {
    const datos = localStorage.getItem(this.claveStorage);

    if (!datos) {
      this.guardarTodo(this.categoriasIniciales);
      return this.categoriasIniciales;
    }

    const categoriasGuardadas = JSON.parse(datos) as CategoriaGestionAnterior[];
    const categorias = categoriasGuardadas.map(categoria => this.normalizarCategoria(categoria));

    if (categoriasGuardadas.some(categoria => typeof categoria.idCategoria !== 'string')) {
      this.guardarTodo(categorias);
    }

    return categorias;
  }

  listarActivas(): CategoriaGestion[] {
    return this.listar().filter(categoria => categoria.activo);
  }

  crear(
    categoria: Omit<CategoriaGestion, 'idCategoria' | 'fechaCreacion' | 'fechaActualizacion'>
  ): CategoriaGestion {
    const categorias = this.listar();

    const nuevaCategoria: CategoriaGestion = {
      ...categoria,
      idCategoria: crypto.randomUUID(),
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    };

    categorias.push(nuevaCategoria);
    this.guardarTodo(categorias);

    return nuevaCategoria;
  }

  actualizar(idCategoria: string, categoriaActualizada: Partial<CategoriaGestion>): void {
    const categorias = this.listar();

    const categoriasActualizadas = categorias.map(categoria => {
      if (categoria.idCategoria !== idCategoria) {
        return categoria;
      }

      return {
        ...categoria,
        ...categoriaActualizada,
        fechaActualizacion: new Date().toISOString()
      };
    });

    this.guardarTodo(categoriasActualizadas);
  }

  cambiarEstado(idCategoria: string): void {
    const categorias = this.listar();

    const categoriasActualizadas = categorias.map(categoria => {
      if (categoria.idCategoria !== idCategoria) {
        return categoria;
      }

      return {
        ...categoria,
        activo: !categoria.activo,
        fechaActualizacion: new Date().toISOString()
      };
    });

    this.guardarTodo(categoriasActualizadas);
  }

  existeNombre(nombre: string, idCategoriaActual?: string): boolean {
    const nombreLimpio = nombre.trim().toLowerCase();

    return this.listar().some(categoria =>
      categoria.nombre.trim().toLowerCase() === nombreLimpio &&
      categoria.idCategoria !== idCategoriaActual
    );
  }

  private normalizarCategoria(categoria: CategoriaGestionAnterior): CategoriaGestion {
    const fechaActual = new Date().toISOString();
    const categoriaBase = this.categoriasIniciales.find(
      item => item.nombre.trim().toLowerCase() === categoria.nombre?.trim().toLowerCase()
    );

    return {
      idCategoria: typeof categoria.idCategoria === 'string'
        ? categoria.idCategoria
        : categoriaBase?.idCategoria ?? crypto.randomUUID(),
      nombre: categoria.nombre ?? '',
      descripcion: categoria.descripcion ?? '',
      activo: categoria.activo ?? true,
      fechaCreacion: categoria.fechaCreacion ?? fechaActual,
      fechaActualizacion: categoria.fechaActualizacion ?? fechaActual
    };
  }

  private guardarTodo(categorias: CategoriaGestion[]): void {
    localStorage.setItem(this.claveStorage, JSON.stringify(categorias));
  }
}
