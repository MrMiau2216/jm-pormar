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
    path: '**',
    redirectTo: ''
  }
];
