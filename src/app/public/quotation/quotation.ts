import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { buildWhatsappUrl } from '../../shared/data/company-info';
import { RucLookupService } from '../../shared/services/ruc-lookup.service';

interface QuoteItem {
  id: number;
  code: string;
  name: string;
  category: string;
  quantity: number;
}

@Component({
  selector: 'app-quotation',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './quotation.html',
  styleUrl: './quotation.scss'
})
export class Quotation implements OnInit {
  private storageKey = 'jm_pormar_quote';

  items: QuoteItem[] = [];

  quoteForm = {
    nombre: '',
    empresa: '',
    razonSocial: '',
    ruc: '',
    telefono: '',
    detalle: ''
  };

  rucSearching = false;
  rucMessage = '';

  constructor(private rucLookupService: RucLookupService) {}

  ngOnInit(): void {
    this.loadItems();
  }

  get totalProducts(): number {
    return this.items.length;
  }

  get totalUnits(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  loadItems(): void {
    this.items = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  }

  saveItems(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.items));
  }

  increaseQuantity(item: QuoteItem): void {
    item.quantity += 1;
    this.saveItems();
  }

  decreaseQuantity(item: QuoteItem): void {
    if (item.quantity > 1) {
      item.quantity -= 1;
      this.saveItems();
    }
  }

  removeItem(itemId: number): void {
    this.items = this.items.filter(item => item.id !== itemId);
    this.saveItems();
  }

  clearQuote(): void {
    const confirmClear = confirm('¿Deseas limpiar toda la lista de cotización?');

    if (!confirmClear) {
      return;
    }

    this.items = [];
    localStorage.removeItem(this.storageKey);
  }

  onRucInput(): void {
    this.quoteForm.ruc = this.quoteForm.ruc.replace(/\D/g, '');

    if (this.quoteForm.ruc.length < 11) {
      this.quoteForm.razonSocial = '';
      this.rucMessage = '';
    }

    if (this.quoteForm.ruc.length === 11) {
      this.searchRuc();
    }
  }

  searchRuc(): void {
    const ruc = this.quoteForm.ruc.trim();

    if (!ruc) {
      this.quoteForm.razonSocial = '';
      this.rucMessage = '';
      return;
    }

    if (ruc.length !== 11) {
      this.quoteForm.razonSocial = '';
      this.rucMessage = 'El RUC debe tener 11 dígitos.';
      return;
    }

    this.rucSearching = true;
    this.rucMessage = 'Buscando razón social...';

    this.rucLookupService.searchByRuc(ruc).subscribe(result => {
      this.rucSearching = false;

      if (!result) {
        this.quoteForm.razonSocial = '';
        this.rucMessage = 'No se encontró razón social para este RUC.';
        return;
      }

      this.quoteForm.razonSocial = result.razonSocial;
      this.rucMessage = 'Razón social encontrada.';
    });
  }

  private validateQuoteForm(): boolean {
    if (this.items.length === 0) {
      alert('Agrega al menos un producto a la cotización.');
      return false;
    }

    if (!this.quoteForm.nombre.trim()) {
      alert('Ingresa tu nombre completo.');
      return false;
    }

    if (!this.quoteForm.telefono.trim()) {
      alert('Ingresa tu número de teléfono.');
      return false;
    }

    if (this.quoteForm.ruc && this.quoteForm.ruc.length !== 11) {
      alert('El RUC debe tener 11 dígitos.');
      return false;
    }

    if (this.quoteForm.ruc && !this.quoteForm.razonSocial) {
      alert('Valida el RUC para obtener la razón social.');
      return false;
    }

    return true;
  }

  sendByWhatsapp(): void {
    if (!this.validateQuoteForm()) {
      return;
    }

    const productList = this.items
      .map((item, index) => {
        return `${index + 1}. ${item.name}
   Código: ${item.code}
   Categoría: ${item.category}
   Cantidad: ${item.quantity}`;
      })
      .join('\n\n');

    const message = `
Hola JM Pormar, buen día.

Quisiera solicitar una cotización. Les comparto mis datos:

DATOS DEL SOLICITANTE
• Nombre: ${this.quoteForm.nombre}
• Empresa / Institución: ${this.quoteForm.empresa || 'No indicado'}
• RUC: ${this.quoteForm.ruc || 'No indicado'}
• Razón social: ${this.quoteForm.razonSocial || 'No indicada'}
• Teléfono: ${this.quoteForm.telefono}

PRODUCTOS DE INTERÉS
${productList}

DETALLE ADICIONAL
${this.quoteForm.detalle || 'No indicado'}

Quedo atento a su confirmación de disponibilidad, precio y tiempo de atención.
Gracias.
`.trim();

    window.open(buildWhatsappUrl(message), '_blank');
  }
}
