import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs'; // Respuestas asincronas
import { User } from '../models/user';     // ✅ importar modelo desde /models

const STORAGE_KEY_USER = 'userActual';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  // Estado interno con BehaviorSubject para reflejar cambios en tiempo real
  private userActualSubject: BehaviorSubject<User | null>;
  public userActual$: Observable<User | null>;

  constructor() {
    // Cargamos user desde localStorage al arrancar el sistema
    const userSaved = localStorage.getItem(STORAGE_KEY_USER);

    const userInicial: User | null = userSaved
      ? JSON.parse(userSaved)
      : null;

    // BehaviorSubject mantiene el último valor y lo emite inmediatamente
    this.userActualSubject = new BehaviorSubject<User | null>(userInicial);
    this.userActual$ = this.userActualSubject.asObservable();
  }

  // -------------------------------------------------------------
  // Getter síncrono del user actual
  // -------------------------------------------------------------
  get userActual(): User | null {
    return this.userActualSubject.value;
  }

  // -------------------------------------------------------------
  // LOGIN REAL (viene del backend)
  // Se usa en LoginComponent después de llamar al servicio usersService
  // -------------------------------------------------------------
  login(user: User): void {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    this.userActualSubject.next(user);
  }

  // -------------------------------------------------------------
  // LOGIN LOCAL (USADO POR PERFIL)
  // Se usa para refrescar sesión local después de un PUT sin relogueo
  // -------------------------------------------------------------
  loginLocal(userUpdated: User): void {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userUpdated));
    this.userActualSubject.next(userUpdated);
  }

  // -------------------------------------------------------------
  // LOGOUT
  // -------------------------------------------------------------
  logout(): void {
    localStorage.removeItem(STORAGE_KEY_USER);
    this.userActualSubject.next(null);
  }

  // -------------------------------------------------------------
  // Helpers para templates y guards
  // -------------------------------------------------------------
  isLogged(): boolean {
    return !!this.userActualSubject.value;
  }

  isAdmin(): boolean {
    return this.userActualSubject.value?.rol === 'ADMIN';
  }

  isTechnician(): boolean {
    return this.userActualSubject.value?.rol === 'TECNICO';
  }

  getRole(): string | null {
    return this.userActualSubject.value?.rol || null;
  }
}