import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
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
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(Products);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset public filters', () => {
    component.searchTerm = 'cemento';
    component.selectedCategoryId = 'categoria';
    component.selectedAvailability = 'DISPONIBLE';
    component.resetFilters();

    expect(component.searchTerm).toBe('');
    expect(component.selectedCategoryId).toBe('');
    expect(component.selectedAvailability).toBe('');
  });
});
