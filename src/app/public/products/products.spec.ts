import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Products } from './products';

describe('Products', () => {
  let component: Products;
  let fixture: ComponentFixture<Products>;

  beforeEach(async () => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        clear: () => undefined,
        getItem: () => null,
        key: () => null,
        length: 0,
        removeItem: () => undefined,
        setItem: () => undefined,
      } satisfies Storage,
    });

    await TestBed.configureTestingModule({
      imports: [Products],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Products);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should only list available products', () => {
    expect(component.filteredProducts.every(product => product.available)).toBe(true);
  });

  it('should apply search only when requested', () => {
    const initialCount = component.filteredProducts.length;

    component.searchTerm = 'cemento';
    expect(component.filteredProducts.length).toBe(initialCount);

    component.applySearch();
    expect(component.filteredProducts.every(product =>
      product.name.toLowerCase().includes('cemento')
    )).toBe(true);
  });
});
