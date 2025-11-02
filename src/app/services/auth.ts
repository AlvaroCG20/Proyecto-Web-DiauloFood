import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL = 'http://localhost:3000/auth';

  constructor(private http: HttpClient) {}

  login(datos: any): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, datos);
  }

  register(datos: any): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, datos);
  }
}
