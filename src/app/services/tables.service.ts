import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Cómo responde el BACKEND
export interface BackendTable {
  numero_mesa: number;
  capacidad: number;
  disponibilidad: 'disponible' | 'ocupada' | 'reservada';
  ubicacion: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class TablesService {

  // Ajusta si usas otra URL o puerto
  private apiUrl = 'http://localhost:3000/tables';

  constructor(private http: HttpClient) {}

  // GET /tables
  getTables(): Observable<BackendTable[]> {
    return this.http.get<BackendTable[]>(this.apiUrl);
  }

  // GET /tables/:id
  getTable(numero_mesa: number): Observable<BackendTable> {
    return this.http.get<BackendTable>(`${this.apiUrl}/${numero_mesa}`);
  }

  // POST /tables
  createTable(table: Partial<BackendTable>): Observable<BackendTable> {
    return this.http.post<BackendTable>(this.apiUrl, table);
  }

  // PUT /tables/:id
  updateTable(numero_mesa: number, table: Partial<BackendTable>): Observable<BackendTable> {
    return this.http.put<BackendTable>(`${this.apiUrl}/${numero_mesa}`, table);
  }

  // DELETE /tables/:id
  deleteTable(numero_mesa: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${numero_mesa}`);
  }
}
