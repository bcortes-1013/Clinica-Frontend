import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private apiUrl = `${environment.apiBaseUrl}/users`;

  constructor(private http: HttpClient) {}

  // ----------------------- LOGIN --------------------------------
  login(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, { email, password });
  }

  // ----------------------- REGISTRO ------------------------------
  register(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, user);
  }

  // ----------------------- RECUPERAR -----------------------------
  recoverByEmail(email: string) {
    return this.http.get(`${this.apiUrl}/recover/${email}`, { responseType: 'text' });
  }

  // ----------------------- PERFIL (GET) --------------------------
  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/id/${id}`);
  }

  // ----------------------- PERFIL (PUT) --------------------------
  updateProfile(id: number, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile/${id}`, data);
  }

    // ----------------------- PERFIL (PUT) --------------------------
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  // ----------------------- ADMIN: LISTAR TODOS -------------------
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}`);
  }
}