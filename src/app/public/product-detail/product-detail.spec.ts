import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ProductDetail } from './product-detail';

describe('ProductDetail', () => {
  let component: ProductDetail;
  let fixture: ComponentFixture<ProductDetail>;

  beforeEach(async () => {
    Object.defineProperty(window, 'scrollTo', {
      configurable: true,
      value: () => undefined,
    });

    await TestBed.configureTestingModule({
      imports: [ProductDetail],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show available products from the same category', () => {
    component.product = component.products.find(product => product.id === 3);

    expect(component.relatedProducts.map(product => product.name)).toEqual([
      'Rotomartillo SDS Plus',
      'Esmeril Angular 4 1/2"',
    ]);
  });
});
