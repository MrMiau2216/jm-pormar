import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
  Producto,
  QuoteItem
} from '../models/domain.models';

@Injectable({ providedIn: 'root' })
export class QuoteService {

 private readonly storageKey = 'jm_pormar_quote';

private readonly expirationKey =
  'jm_pormar_quote_expires_at';

private readonly quoteLifetimeMs =
  7 * 24 * 60 * 60 * 1000;// 7 días en milisegundos

private expirationTimer?: ReturnType<typeof setTimeout>;

  private readonly itemsSubject =
    new BehaviorSubject<QuoteItem[]>(this.readStorage());

  readonly items$ = this.itemsSubject.asObservable();

constructor() {
  this.scheduleExpiration();

  window.addEventListener('storage', event => {
    if (
      event.key === this.storageKey ||
      event.key === this.expirationKey
    ) {
      this.itemsSubject.next(this.readStorage());
      this.scheduleExpiration();
    }
  });

  window.addEventListener(
    'jm-pormar-quote-changed',
    () => {
      this.itemsSubject.next(this.readStorage());
      this.scheduleExpiration();
    }
  );
}

  get items(): QuoteItem[] {
    return this.getCurrentItems().map(item => ({ ...item }));
  }

  get count(): number {
    return this.getCurrentItems().reduce(
      (total, item) => total + item.quantity,
      0
    );
  }

  get productCount(): number {
    return this.getCurrentItems().length;
  }

  add(product: Producto, quantity = 1): void {
    const validQuantity = Math.max(
      1,
      Math.trunc(Number(quantity) || 1)
    );

    const items = this.getCurrentItems().map(
      item => ({ ...item })
    );

    const existingIndex = items.findIndex(
      item => item.id === product.idProducto
    );

    if (existingIndex >= 0) {
      const existing = items[existingIndex];

      items[existingIndex] = {
        ...existing,
        quantity: existing.quantity + validQuantity
      };
    } else {
      items.push({
        id: product.idProducto,
        code: product.codigoSku,
        name: product.nombre,
        category: product.categoria,
        quantity: validQuantity
      });
    }

    this.persist(items);
  }

  increase(id: string): void {
    this.persist(
      this.getCurrentItems().map(item =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1
            }
          : { ...item }
      )
    );
  }

  decrease(id: string): void {
    this.persist(
      this.getCurrentItems().map(item =>
        item.id === id && item.quantity > 1
          ? {
              ...item,
              quantity: item.quantity - 1
            }
          : { ...item }
      )
    );
  }

  remove(id: string): void {
    this.persist(
      this.getCurrentItems()
        .filter(item => item.id !== id)
        .map(item => ({ ...item }))
    );
  }

  clear(): void {
    this.persist([]);
  }

  buildWhatsappOrderMessage(): string {
    // Se vuelve a leer localStorage justo antes de construir
    // el mensaje para evitar usar un estado antiguo del servicio.
    const storedItems = this.readStorage();
    const currentItems = this.itemsSubject.value;

    const items = storedItems.length
      ? storedItems
      : currentItems;

    if (!items.length) {
      return (
        'Hola JM Pormar, buen día.\n\n' +
        'Deseo solicitar información sobre sus productos y servicios.'
      );
    }

    const now = new Date();
    const orderNumber = this.generateOrderNumber(now);
    const orderDate = this.formatOrderDate(now);

    const productList = items
      .map(
        (item, index) =>
          `${index + 1}. *${item.name}*\n` +
          `   • Código: ${item.code}\n` +
          `   • Categoría: ${item.category}\n` +
          `   • Cantidad solicitada: ${item.quantity}`
      )
      .join('\n\n');

    const totalUnits = items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    return (
      `*PEDIDO N.° ${orderNumber}*\n` +
      `Fecha: ${orderDate}\n\n` +
      'Hola JM Pormar, buen día.\n\n' +
      '*ESTOY INTERESADO EN:*\n\n' +
      `${productList}\n\n` +
      '*RESUMEN DEL PEDIDO*\n' +
      `• Productos diferentes: ${items.length}\n` +
      `• Cantidad total: ${totalUnits}\n\n` +
      '*SOLICITO:*\n' +
      'Por favor, confirmar precio, disponibilidad, ' +
      'forma de pago, tiempo de atención y entrega.\n\n' +
      'Quedo atento a su respuesta. Gracias.'
    );
  }

  private getCurrentItems(): QuoteItem[] {
    const current = this.itemsSubject.value;

    if (current.length) {
      return current;
    }

    const stored = this.readStorage();

    if (stored.length) {
      this.itemsSubject.next(stored);
    }

    return stored;
  }

private readStorage(): QuoteItem[] {
  try {
    const expiresAt = Number(
      localStorage.getItem(this.expirationKey)
    );

    if (
      Number.isFinite(expiresAt) &&
      expiresAt > 0 &&
      Date.now() >= expiresAt
    ) {
      this.clearStorage();
      return [];
    }

    const raw = localStorage.getItem(
      this.storageKey
    );

    const parsed = JSON.parse(
      raw ?? '[]'
    ) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(item => this.normalizeItem(item))
      .filter(
        (item): item is QuoteItem =>
          item !== null
      );
  } catch (error) {
    console.warn(
      'No se pudo leer la cotización.',
      error
    );

    this.clearStorage();
    return [];
  }
}

  private normalizeItem(value: unknown): QuoteItem | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const item = value as Record<string, unknown>;

    // Soporta tanto la estructura actual como datos antiguos
    // que pudieron haberse guardado como Producto.
    const id = String(
      item['id'] ?? item['idProducto'] ?? ''
    ).trim();

    const code = String(
      item['code'] ?? item['codigoSku'] ?? ''
    ).trim();

    const name = String(
      item['name'] ?? item['nombre'] ?? ''
    ).trim();

    const category = String(
      item['category'] ?? item['categoria'] ?? ''
    ).trim();

    const rawQuantity = Number(
      item['quantity'] ?? item['cantidad'] ?? 1
    );

    if (!id || !code || !name) {
      return null;
    }

    return {
      id,
      code,
      name,
      category: category || 'Sin categoría',
      quantity: Math.max(
        1,
        Math.trunc(
          Number.isFinite(rawQuantity)
            ? rawQuantity
            : 1
        )
      )
    };
  }

 private persist(items: QuoteItem[]): void {
  const normalizedItems = items.map(item => ({
    ...item,
    quantity: Math.max(
      1,
      Math.trunc(item.quantity)
    )
  }));

  this.itemsSubject.next(normalizedItems);

  try {
    if (normalizedItems.length === 0) {
      this.clearStorage();
    } else {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(normalizedItems)
      );

      localStorage.setItem(
        this.expirationKey,
        String(
          Date.now() +
          this.quoteLifetimeMs
        )
      );
    }

    this.scheduleExpiration();

    window.dispatchEvent(
      new Event('jm-pormar-quote-changed')
    );
  } catch (error) {
    console.warn(
      'No se pudo guardar la cotización.',
      error
    );
  }
}

  private generateOrderNumber(date: Date): string {
    const pad = (value: number): string =>
      value.toString().padStart(2, '0');

    return [
      'JMP',
      `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`,
      `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
    ].join('-');
  }

  private formatOrderDate(date: Date): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  private clearStorage(): void {
  localStorage.removeItem(this.storageKey);
  localStorage.removeItem(this.expirationKey);

  if (this.expirationTimer) {
    clearTimeout(this.expirationTimer);
    this.expirationTimer = undefined;
  }
}

private scheduleExpiration(): void {
  if (this.expirationTimer) {
    clearTimeout(this.expirationTimer);
    this.expirationTimer = undefined;
  }

  const expiresAt = Number(
    localStorage.getItem(this.expirationKey)
  );

  if (
    !Number.isFinite(expiresAt) ||
    expiresAt <= 0
  ) {
    return;
  }

  const remainingTime =
    expiresAt - Date.now();

  if (remainingTime <= 0) {
    this.clear();
    return;
  }

  this.expirationTimer = setTimeout(
    () => {
      this.clear();

      window.dispatchEvent(
        new Event('jm-pormar-quote-changed')
      );
    },
    remainingTime
  );
}
}
