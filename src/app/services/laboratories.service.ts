import { Injectable } from '@angular/core';                   // Para declarar un servicio inyectable
import { HttpClient } from '@angular/common/http';            // Cliente HTTP nativo de Angular
import { Observable } from 'rxjs';                            // Mecanismo reactivo para respuestas asíncronas
import { environment } from '../../environments/environment'; // Donde está la URL base del backend
import { Laboratory } from '../models/laboratory';     // ✅ importar modelo desde /models

@Injectable({
  providedIn: 'root' // (Semana 3) Disponible en toda la app sin declararlo en un módulo
})
export class LaboratoriesService {

  private readonly apiUrl = `${environment.apiBaseUrl}/laboratories`;

  // Angular "inyecta" HttpClient para poder hacer solicitudes HTTP
  constructor(private http: HttpClient) {}

  getAll(): Observable<Laboratory[]> {
    return this.http.get<Laboratory[]>(this.apiUrl);
  }

  getById(id: number): Observable<Laboratory> {
    return this.http.get<Laboratory>(`${this.apiUrl}/id/${id}`);
  }

  create(data: Omit<Laboratory, 'id'>): Observable<Laboratory> {
    return this.http.post<Laboratory>(this.apiUrl, data);
  }

  update(id: number, data: Partial<Laboratory>): Observable<Laboratory> {
    return this.http.put<Laboratory>(`${this.apiUrl}/id/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/id/${id}`);
  }
}
