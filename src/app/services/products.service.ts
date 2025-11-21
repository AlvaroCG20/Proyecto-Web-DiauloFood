import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BackendProduct {
  id_producto: number;
  nombre_producto: string;
  precio_venta: number;
  costo_compra: number;
  margen_ganancia: number;
  descripcion: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private apiUrl = 'http://localhost:3000/products';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<BackendProduct[]> {
    return this.http.get<BackendProduct[]>(this.apiUrl);
  }

  getProduct(id: number): Observable<BackendProduct> {
    return this.http.get<BackendProduct>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: Partial<BackendProduct>): Observable<BackendProduct> {
    return this.http.post<BackendProduct>(this.apiUrl, product);
  }

  updateProduct(id: number, product: Partial<BackendProduct>): Observable<BackendProduct> {
    return this.http.put<BackendProduct>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
