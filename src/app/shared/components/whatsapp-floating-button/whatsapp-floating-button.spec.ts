import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappFloatingButton } from './whatsapp-floating-button';

describe('WhatsappFloatingButton', () => {
  let component: WhatsappFloatingButton;
  let fixture: ComponentFixture<WhatsappFloatingButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsappFloatingButton],
    }).compileComponents();

    fixture = TestBed.createComponent(WhatsappFloatingButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
