import { Routes } from '@angular/router';
import { Home } from './public/home/home';
import { Products } from './public/products/products';
import { ProductDetail } from './public/product-detail/product-detail';
import { Quotation } from './public/quotation/quotation';
import { Services } from './public/services/services';
import { Certifications } from './public/certifications/certifications';
import { Contact } from './public/contact/contact';
import { About } from './public/about/about';
import { PrivacyPolicy } from './public/privacy-policy/privacy-policy';
import { TermsConditions } from './public/terms-conditions/terms-conditions';
import { Ingreso } from './gestion-interna/acceso/ingreso';
import { PlantillaGestion } from './gestion-interna/estructura/plantilla-gestion';
import { accesoInternoGuard } from './gestion-interna/seguridad/acceso-interno.guard';
import { InicioGestion } from './gestion-interna/paginas/inicio/inicio-gestion';
import { ProductosGestion } from './gestion-interna/paginas/productos/productos-gestion';
import { CategoriasGestion } from './gestion-interna/paginas/categorias/categorias-gestion';
import { ServiciosGestion } from './gestion-interna/paginas/servicios/servicios-gestion';
import { CertificacionesGestion } from './gestion-interna/paginas/certificaciones/certificaciones-gestion';
import { ContactoGestion } from './gestion-interna/paginas/contacto/contacto-gestion';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'nosotros',
    component: About
  },
  {
    path: 'productos',
    component: Products
  },
  {
    path: 'productos/:id',
    component: ProductDetail
  },
  {
    path: 'cotizacion',
    component: Quotation
  },
  {
    path: 'servicios',
    component: Services
  },
  {
    path: 'certificaciones',
    component: Certifications
  },
  {
    path: 'contacto',
    component: Contact
  },
  {
    path: 'politica-privacidad',
    component: PrivacyPolicy
  },
  {
    path: 'terminos-condiciones',
    component: TermsConditions
  },
  {
    path: 'portal-jmp/login',
    component: Ingreso
  },
  {
    path: 'portal-jmp',
    component: PlantillaGestion,
    canActivate: [accesoInternoGuard],
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
      },
      {
        path: 'inicio',
        component: InicioGestion
      },
      {
        path: 'productos',
        component: ProductosGestion
      },
      {
        path: 'categorias',
        component: CategoriasGestion
      },
      {
        path: 'servicios',
        component: ServiciosGestion
      },
      {
        path: 'certificaciones',
        component: CertificacionesGestion
      },
      {
        path: 'contacto',
        component: ContactoGestion
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
