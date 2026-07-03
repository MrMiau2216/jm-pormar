import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PRODUCTS_DATA, ProductData } from '../../shared/data/products-data';
import { buildWhatsappUrl } from '../../shared/data/company-info';

interface QuoteItem {
  id: number;
  code: string;
  name: string;
  category: string;
  quantity: number;
}

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetail implements OnInit {
  products: ProductData[] = PRODUCTS_DATA;
  product?: ProductData;

  selectedImage = '';
  quantity = 1;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.product = this.products.find(item => item.id === id) ?? this.products[0];
      this.selectedImage = this.product.mainImage;
      this.quantity = 1;

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    });
  }

  get relatedProducts(): ProductData[] {
    if (!this.product) {
      return [];
    }

    return this.products
      .filter(item =>
        item.category === this.product?.category &&
        item.id !== this.product?.id &&
        item.available
      )
      .slice(0, 4);
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }

  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToQuote(): void {
    if (!this.product) {
      return;
    }

    const storageKey = 'jm_pormar_quote';
    const currentItems: QuoteItem[] = JSON.parse(localStorage.getItem(storageKey) || '[]');

    const existingItem = currentItems.find(item => item.id === this.product?.id);

    if (existingItem) {
      existingItem.quantity += this.quantity;
    } else {
      currentItems.push({
        id: this.product.id,
        code: this.product.code,
        name: this.product.name,
        category: this.product.category,
        quantity: this.quantity
      });
    }

    localStorage.setItem(storageKey, JSON.stringify(currentItems));
    alert('Producto agregado a la lista de cotización.');
  }

  quoteByWhatsapp(): void {
    if (!this.product) {
      return;
    }

    const message = `
Hola JM Pormar, buen día.

Quisiera solicitar una cotización para este producto:

PRODUCTO DE INTERÉS
• Producto: ${this.product.name}
• Código: ${this.product.code}
• Categoría: ${this.product.category}
• Cantidad referencial: ${this.quantity}

Quedo atento a su confirmación de disponibilidad, precio y tiempo de atención.
Gracias.
`.trim();

    window.open(buildWhatsappUrl(message), '_blank');
  }
}
