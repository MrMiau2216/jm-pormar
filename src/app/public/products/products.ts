import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { SweetAlertService } from '../../compartido/servicios/sweet-alert.service';
import { assetUrl } from '../../core/utils/api-url';
import { getHttpErrorMessage } from '../../core/utils/http-error';
import { Categoria, Producto } from '../../shared/models/domain.models';
import { CategoryService } from '../../shared/services/category.service';
import { ProductService } from '../../shared/services/product.service';
import { QuoteService } from '../../shared/services/quote.service';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class Products implements OnInit, AfterViewInit {
  searchTerm = '';
  selectedCategoryId = '';
  showSuggestions = false;

  currentPage = 0;
  pageSize = 8;
  totalPages = 0;
  totalElements = 0;
  products: Producto[] = [];
  categories: Categoria[] = [];
  loading = false;
  errorMessage = '';
  quoteCount = 0;

  constructor(
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
    private readonly quoteService: QuoteService,
    private readonly sweetAlert: SweetAlertService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.categoryService.getPublic().subscribe({
      next: categories => {
        this.categories = [...categories];
        this.cdr.detectChanges();
      },
      error: error => {
        this.categories = [];
        this.errorMessage = getHttpErrorMessage(error, 'No se pudieron cargar las categorías.');
        this.cdr.detectChanges();
      }
    });

    this.quoteService.items$.subscribe(() => {
      this.quoteCount = this.quoteService.count;
      this.cdr.detectChanges();
    });
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const catalogo = document.getElementById('explorar-catalogo');
      catalogo?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 250);
  }

  get searchSuggestions(): Producto[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (term.length < 2) return [];
    return this.products
      .filter(product => product.nombre.toLowerCase().includes(term) || product.codigoSku.toLowerCase().includes(term))
      .slice(0, 6);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index);
  }

  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.productService.getPublicProducts({
      buscar: this.searchTerm.trim() || undefined,
      categoriaId: this.selectedCategoryId || undefined,
      page: this.currentPage,
      size: this.pageSize
    })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: page => {
          this.products = [...page.content];
          this.currentPage = page.page;
          this.totalPages = page.totalPages;
          this.totalElements = page.totalElements;
          this.cdr.detectChanges();
        },
        error: error => {
          this.products = [];
          this.errorMessage = getHttpErrorMessage(error, 'No se pudo cargar el catálogo.');
          this.cdr.detectChanges();
        }
      });
  }

  applySearch(): void {
    this.showSuggestions = false;
    this.currentPage = 0;
    this.loadProducts();
  }

  selectSuggestion(product: Producto): void {
    this.searchTerm = product.nombre;
    this.applySearch();
  }

  onSearchTyping(): void {
    this.showSuggestions = this.searchTerm.trim().length >= 2;
    if (!this.searchTerm.trim()) this.applySearch();
  }

  changePage(page: number): void {
    if (page < 0 || page >= this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadProducts();
    window.scrollTo({ top: 300, behavior: 'smooth' });
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategoryId = '';
    this.showSuggestions = false;
    this.currentPage = 0;
    this.loadProducts();
  }

  addToQuote(product: Producto): void {
    if (product.disponibilidad !== 'DISPONIBLE') {
      void this.sweetAlert.advertencia(
        'Producto no disponible',
        'Este producto no se encuentra disponible para cotización.'
      );
      return;
    }

    this.quoteService.add(product, 1);
    this.quoteCount = this.quoteService.count;

    void this.sweetAlert.toast(
      `"${product.nombre}" agregado a la cotización`
    );

    this.cdr.detectChanges();
  }

  imageUrl(product: Producto): string {
    return assetUrl(product.imagenPrincipalUrl);
  }
}
