export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductData {
  id: number;
  code: string;
  name: string;
  category: string;
  available: boolean;
  shortDescription: string;
  fullDescription: string;
  image: string;
  mainImage: string;
  gallery: string[];
  characteristics: string[];
  specifications: ProductSpec[];
}

export const PRODUCTS_DATA: ProductData[] = [
  {
    id: 1,
    code: 'MAT-001',
    name: 'Cemento Portland Tipo I',
    category: 'Materiales',
    available: true,
    shortDescription: 'Cemento de uso general para obras de construcción, columnas, vigas y zapatas.',
    fullDescription:
      'Cemento recomendado para trabajos generales de construcción, albañilería, columnas, vigas, zapatas, tarrajeos y pisos. Ideal para obras, empresas y proyectos que requieren materiales confiables.',
    image: '/images/producto-cemento.jpg',
    mainImage: '/images/producto-cemento.jpg',
    gallery: [
      '/images/producto-cemento.jpg',
      '/images/producto-cemento-2.jpg',
      '/images/producto-cemento-3.jpg'
    ],
    characteristics: [
      'Bolsa de 42.5 kg',
      'Uso en construcción general',
      'Buena resistencia',
      'Aplicación en obras y proyectos'
    ],
    specifications: [
      { label: 'Presentación', value: 'Bolsa de 42.5 kg' },
      { label: 'Categoría', value: 'Materiales' },
      { label: 'Uso', value: 'Construcción general' }
    ]
  },
  {
    id: 2,
    code: 'TUB-001',
    name: 'Tubo PVC Presión Clase 10',
    category: 'Tuberías',
    available: true,
    shortDescription: 'Tubería de PVC para conducción de fluidos a presión e instalaciones de agua.',
    fullDescription:
      'Tubo PVC de alta resistencia para instalaciones de agua, conducción de fluidos y trabajos de obra. Recomendado para proyectos residenciales, comerciales e industriales.',
    image: '/images/producto-tubo-pvc.jpg',
    mainImage: '/images/producto-tubo-pvc.jpg',
    gallery: [
      '/images/producto-tubo-pvc.jpg',
      '/images/producto-tubo-pvc-2.jpg'
    ],
    characteristics: [
      'Alta resistencia química',
      'Uso en instalaciones de agua',
      'Buena durabilidad',
      'Fácil instalación'
    ],
    specifications: [
      { label: 'Material', value: 'PVC' },
      { label: 'Clase', value: 'Presión Clase 10' },
      { label: 'Uso', value: 'Conducción de fluidos' }
    ]
  },
  {
    id: 3,
    code: 'HER-001',
    name: 'Taladro Percutor Industrial',
    category: 'Herramientas',
    available: true,
    shortDescription: 'Herramienta eléctrica para perforación en concreto, metal y madera.',
    fullDescription:
      'Taladro percutor industrial diseñado para trabajos exigentes en construcción, mantenimiento e instalaciones. Permite perforación eficiente en concreto, metal y madera.',
    image: '/images/producto-taladro.jpg',
    mainImage: '/images/producto-taladro.jpg',
    gallery: [
      '/images/producto-taladro.jpg',
      '/images/producto-taladro-2.jpg',
      '/images/producto-taladro-3.jpg'
    ],
    characteristics: [
      'Uso profesional',
      'Función percutora',
      'Diseño resistente',
      'Ideal para obra y mantenimiento'
    ],
    specifications: [
      { label: 'Categoría', value: 'Herramientas' },
      { label: 'Uso', value: 'Perforación' },
      { label: 'Aplicación', value: 'Concreto, metal y madera' }
    ]
  },
  {
    id: 4,
    code: 'EPP-001',
    name: 'Guantes de Seguridad de Cuero',
    category: 'EPPS',
    available: true,
    shortDescription: 'Guantes de cuero reforzados para protección contra abrasión y cortes ligeros.',
    fullDescription:
      'Guantes de seguridad de cuero diseñados para proteger las manos durante trabajos de obra, mantenimiento, carga y manipulación de materiales.',
    image: '/images/producto-guantes.jpg',
    mainImage: '/images/producto-guantes.jpg',
    gallery: ['/images/producto-guantes.jpg'],
    characteristics: [
      'Cuero reforzado',
      'Protección para manos',
      'Uso en obra y taller',
      'Resistencia a abrasión'
    ],
    specifications: [
      { label: 'Material', value: 'Cuero' },
      { label: 'Categoría', value: 'EPPS' },
      { label: 'Uso', value: 'Protección manual' }
    ]
  },
  {
    id: 5,
    code: 'FER-001',
    name: 'Llave Ajustable 12"',
    category: 'Ferretería',
    available: true,
    shortDescription: 'Llave ajustable de acero para trabajos de mantenimiento y ferretería general.',
    fullDescription:
      'Llave ajustable de acero recomendada para trabajos de mantenimiento, instalación, ajuste de piezas y uso general en obra o taller.',
    image: '/images/producto-llave.jpg',
    mainImage: '/images/producto-llave.jpg',
    gallery: [
      '/images/producto-llave.jpg',
      '/images/producto-llave-2.jpg'
    ],
    characteristics: [
      'Acero resistente',
      'Apertura ajustable',
      'Uso manual',
      'Ideal para mantenimiento'
    ],
    specifications: [
      { label: 'Medida', value: '12 pulgadas' },
      { label: 'Categoría', value: 'Ferretería' },
      { label: 'Uso', value: 'Ajuste y mantenimiento' }
    ]
  },
  {
    id: 6,
    code: 'ELE-001',
    name: 'Cable Eléctrico THW 12 AWG',
    category: 'Electricidad',
    available: true,
    shortDescription: 'Cable de cobre para instalaciones eléctricas residenciales e industriales.',
    fullDescription:
      'Cable eléctrico THW recomendado para instalaciones eléctricas en viviendas, comercios, obras e industrias, según el requerimiento técnico del proyecto.',
    image: '/images/producto-cable.jpg',
    mainImage: '/images/producto-cable.jpg',
    gallery: ['/images/producto-cable.jpg'],
    characteristics: [
      'Conductor de cobre',
      'Uso eléctrico',
      'Aplicación residencial e industrial',
      'Aislamiento resistente'
    ],
    specifications: [
      { label: 'Tipo', value: 'THW' },
      { label: 'Calibre', value: '12 AWG' },
      { label: 'Categoría', value: 'Electricidad' }
    ]
  },
  {
    id: 7,
    code: 'ELE-002',
    name: 'Interruptor Termomagnético 2x32A',
    category: 'Electricidad',
    available: false,
    shortDescription: 'Interruptor para protección de circuitos eléctricos contra sobrecargas.',
    fullDescription:
      'Interruptor termomagnético utilizado para proteger circuitos eléctricos frente a sobrecargas o cortocircuitos, según el diseño eléctrico correspondiente.',
    image: '/images/producto-interruptor.jpg',
    mainImage: '/images/producto-interruptor.jpg',
    gallery: ['/images/producto-interruptor.jpg'],
    characteristics: [
      'Protección eléctrica',
      'Uso en tableros',
      'Diseño compacto',
      'Aplicación residencial o industrial'
    ],
    specifications: [
      { label: 'Tipo', value: 'Termomagnético' },
      { label: 'Capacidad', value: '2x32A' },
      { label: 'Categoría', value: 'Electricidad' }
    ]
  },
  {
    id: 8,
    code: 'EPP-002',
    name: 'Casco de Seguridad Tipo I',
    category: 'EPPS',
    available: true,
    shortDescription: 'Casco de seguridad para protección en obras, talleres e industrias.',
    fullDescription:
      'Casco de seguridad diseñado para proteger al trabajador en ambientes de obra, mantenimiento, industria y actividades operativas.',
    image: '/images/producto-casco.jpg',
    mainImage: '/images/producto-casco.jpg',
    gallery: [
      '/images/producto-casco.jpg',
      '/images/producto-casco-2.jpg'
    ],
    characteristics: [
      'Protección craneal',
      'Uso en obra',
      'Diseño resistente',
      'Ajuste cómodo'
    ],
    specifications: [
      { label: 'Tipo', value: 'Casco Tipo I' },
      { label: 'Categoría', value: 'EPPS' },
      { label: 'Uso', value: 'Protección personal' }
    ]
  },
  {
    id: 9,
    code: 'MAT-002',
    name: 'Ladrillo King Kong',
    category: 'Materiales',
    available: true,
    shortDescription: 'Ladrillo de arcilla para muros, cerramientos y trabajos de albañilería.',
    fullDescription:
      'Ladrillo de arcilla utilizado en construcción de muros, cerramientos, tabiquería y trabajos generales de albañilería.',
    image: '/images/producto-ladrillo.jpg',
    mainImage: '/images/producto-ladrillo.jpg',
    gallery: ['/images/producto-ladrillo.jpg'],
    characteristics: [
      'Material de arcilla',
      'Uso en albañilería',
      'Ideal para muros',
      'Aplicación en obra'
    ],
    specifications: [
      { label: 'Tipo', value: 'King Kong' },
      { label: 'Categoría', value: 'Materiales' },
      { label: 'Uso', value: 'Muros y albañilería' }
    ]
  },
  {
    id: 10,
    code: 'HER-002',
    name: 'Rotomartillo SDS Plus',
    category: 'Herramientas',
    available: true,
    shortDescription: 'Rotomartillo de alto rendimiento para perforación en concreto y obra.',
    fullDescription:
      'Rotomartillo SDS Plus recomendado para trabajos de perforación en concreto, demolición ligera, instalaciones y mantenimiento industrial.',
    image: '/images/producto-rotomartillo.jpg',
    mainImage: '/images/producto-rotomartillo.jpg',
    gallery: [
      '/images/producto-rotomartillo.jpg',
      '/images/producto-rotomartillo-2.jpg'
    ],
    characteristics: [
      'Sistema SDS Plus',
      'Uso profesional',
      'Ideal para concreto',
      'Mayor fuerza de impacto'
    ],
    specifications: [
      { label: 'Sistema', value: 'SDS Plus' },
      { label: 'Categoría', value: 'Herramientas' },
      { label: 'Uso', value: 'Perforación y obra' }
    ]
  },
  {
    id: 11,
    code: 'HER-003',
    name: 'Esmeril Angular 4 1/2"',
    category: 'Herramientas',
    available: true,
    shortDescription: 'Esmeril angular para corte, desbaste y trabajos de mantenimiento.',
    fullDescription:
      'Esmeril angular de uso profesional para corte, desbaste y trabajos de mantenimiento en metal, concreto y otros materiales según el disco utilizado.',
    image: '/images/producto-esmeril.jpg',
    mainImage: '/images/producto-esmeril.jpg',
    gallery: ['/images/producto-esmeril.jpg'],
    characteristics: [
      'Uso profesional',
      'Corte y desbaste',
      'Diseño compacto',
      'Ideal para taller y obra'
    ],
    specifications: [
      { label: 'Medida', value: '4 1/2 pulgadas' },
      { label: 'Categoría', value: 'Herramientas' },
      { label: 'Uso', value: 'Corte y desbaste' }
    ]
  },
  {
    id: 12,
    code: 'TUB-002',
    name: 'Codo PVC 90°',
    category: 'Tuberías',
    available: true,
    shortDescription: 'Accesorio PVC para cambios de dirección en instalaciones sanitarias o de agua.',
    fullDescription:
      'Codo PVC de 90 grados utilizado para realizar cambios de dirección en instalaciones de tuberías, redes de agua o trabajos sanitarios.',
    image: '/images/producto-codo-pvc.jpg',
    mainImage: '/images/producto-codo-pvc.jpg',
    gallery: ['/images/producto-codo-pvc.jpg'],
    characteristics: [
      'Accesorio PVC',
      'Ángulo de 90 grados',
      'Fácil instalación',
      'Uso en redes de agua'
    ],
    specifications: [
      { label: 'Material', value: 'PVC' },
      { label: 'Tipo', value: 'Codo 90°' },
      { label: 'Categoría', value: 'Tuberías' }
    ]
  }
];
