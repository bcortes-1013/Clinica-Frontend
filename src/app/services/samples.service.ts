import { Injectable } from '@angular/core';                   // Para declarar un servicio inyectable
import { HttpClient } from '@angular/common/http';            // Cliente HTTP nativo de Angular
import { Observable } from 'rxjs';                            // Mecanismo reactivo para respuestas asíncronas
import { environment } from '../../environments/environment'; // Donde está la URL base del backend
import { Sample } from '../models/sample';     // ✅ importar modelo desde /models

@Injectable({
  providedIn: 'root'
})
export class SamplesService {

  private readonly apiUrl = `${environment.apiBaseUrl}/samples`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Sample[]> {
    return this.http.get<Sample[]>(this.apiUrl);
  }

  getById(id: number): Observable<Sample> {
    return this.http.get<Sample>(`${this.apiUrl}/id/${id}`);
  }

  create(data: Omit<Sample, 'id'>): Observable<Sample> {
    return this.http.post<Sample>(this.apiUrl, data);
  }

  update(id: number, data: Partial<Sample>): Observable<Sample> {
    return this.http.put<Sample>(`${this.apiUrl}/id/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/id/${id}`);
  }
}