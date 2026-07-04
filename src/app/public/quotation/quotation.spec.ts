import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Quotation } from './quotation';

describe('Quotation', () => {
  let component: Quotation;
  let fixture: ComponentFixture<Quotation>;

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
      imports: [Quotation],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Quotation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should remove non-numeric RUC characters', () => {
    component.quoteForm.ruc = '20A60-123';

    component.onlyDigits('ruc');

    expect(component.quoteForm.ruc).toBe('2060123');
  });
});
