import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {
  private API_URL = 'http://localhost:3000/garzones'; 

  constructor(private http: HttpClient) {}

  agregarGarzon(garzon: any): Observable<any> {
    return this.http.post(`${this.API_URL}/agregar-garzon`, garzon);
  }

  obtenerGarzones(): Observable<any> {
  return this.http.get('http://localhost:3000/garzones/garzones');
}

}
