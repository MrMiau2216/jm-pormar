import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PRODUCTS_DATA, ProductData } from '../data/products-data';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  getProducts(): Observable<ProductData[]> {
    return of(PRODUCTS_DATA);
  }

  getAvailableProducts(): Observable<ProductData[]> {
    return of(PRODUCTS_DATA.filter(product => product.available));
  }

  getProductById(id: number): Observable<ProductData | undefined> {
    return of(PRODUCTS_DATA.find(product => product.id === id));
  }

  getRelatedProducts(category: string, productId: number): Observable<ProductData[]> {
    const relatedProducts = PRODUCTS_DATA
      .filter(product =>
        product.category === category &&
        product.id !== productId &&
        product.available
      )
      .slice(0, 4);

    return of(relatedProducts);
  }
}
