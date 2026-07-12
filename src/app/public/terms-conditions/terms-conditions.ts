import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Contacto } from '../../shared/models/domain.models';
import { ContactService } from '../../shared/services/contact.service';

@Component({
  selector: 'app-terms-conditions',
  imports: [RouterLink],
  templateUrl: './terms-conditions.html',
  styleUrl: './terms-conditions.scss'
})
export class TermsConditions implements OnInit {
  contact?: Contacto;

  constructor(private readonly contactService: ContactService) {}

  ngOnInit(): void {
    this.contactService.getPublic().subscribe({
      next: contact => this.contact = contact,
      error: () => this.contact = undefined
    });
  }

  formatPhone(number?: string | null): string {
    if (!number) {
      return 'No disponible';
    }

    return number.startsWith('51') && number.length === 11
      ? `+51 ${number.slice(2, 5)} ${number.slice(5, 8)} ${number.slice(8)}`
      : number;
  }
}
