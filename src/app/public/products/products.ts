import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PRODUCTS_DATA, ProductData } from '../../shared/data/products-data';

interface QuoteItem {
  id: number;
  code: string;
  name: string;
  category: string;
  quantity: number;
}

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class Products {
  searchTerm = '';
  appliedSearchTerm = '';
  selectedCategory = 'TODAS';
  showSuggestions = false;

  currentPage = 1;
  pageSize = 8;

  quoteCount = 0;

  categories = [
    'TODAS',
    'Materiales',
    'Ferretería',
    'Tuberías',
    'Electricidad',
    'Herramientas',
    'EPPS'
  ];

  products: ProductData[] = PRODUCTS_DATA;

  constructor() {
    this.updateQuoteCount();
  }

  get searchSuggestions(): ProductData[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (term.length < 2) {
      return [];
    }

    return this.products
      .filter(product => {
        const matches =
          product.name.toLowerCase().includes(term) ||
          product.code.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term);

        return product.available && matches;
      })
      .slice(0, 6);
  }

  applySearch(): void {
    this.appliedSearchTerm = this.searchTerm.trim();
    this.showSuggestions = false;
    this.currentPage = 1;
  }

  selectSuggestion(product: ProductData): void {
    this.searchTerm = product.name;
    this.appliedSearchTerm = product.name;
    this.showSuggestions = false;
    this.currentPage = 1;
  }

  onSearchTyping(): void {
    this.showSuggestions = this.searchTerm.trim().length >= 2;

    if (this.searchTerm.trim() === '') {
      this.appliedSearchTerm = '';
      this.currentPage = 1;
    }
  }

  get filteredProducts(): ProductData[] {
    const term = this.appliedSearchTerm.trim().toLowerCase();

    return this.products.filter(product => {
      const isAvailable = product.available;

      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.code.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term);

      const matchesCategory =
        this.selectedCategory === 'TODAS' ||
        product.category === this.selectedCategory;

      return isAvailable && matchesSearch && matchesCategory;
    });
  }

  get pagedProducts(): ProductData[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredProducts.length / this.pageSize));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.appliedSearchTerm = '';
    this.selectedCategory = 'TODAS';
    this.showSuggestions = false;
    this.currentPage = 1;
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  addToQuote(product: ProductData): void {
    const storageKey = 'jm_pormar_quote';
    const currentItems: QuoteItem[] = JSON.parse(localStorage.getItem(storageKey) || '[]');

    const existingItem = currentItems.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      currentItems.push({
        id: product.id,
        code: product.code,
        name: product.name,
        category: product.category,
        quantity: 1
      });
    }

    localStorage.setItem(storageKey, JSON.stringify(currentItems));
    this.updateQuoteCount();
  }

  private updateQuoteCount(): void {
    const items: QuoteItem[] = JSON.parse(localStorage.getItem('jm_pormar_quote') || '[]');
    this.quoteCount = items.reduce((total, item) => total + item.quantity, 0);
  }
}
