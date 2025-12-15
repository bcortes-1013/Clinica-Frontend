import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { User } from '../models/user';

describe('AuthService', () => {
  let service: AuthService;

  const mockUser: User = {
    id: 1,
    fullName: 'Test User',
    email: 'test@test.com',
    rol: 'ADMIN'
  };

  // Mock de localStorage
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};

    spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => (store[key] = value));
    spyOn(localStorage, 'removeItem').and.callFake((key: string) => delete store[key]);

    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ---------------------------------------------------------------
  // Carga inicial desde localStorage
  // ---------------------------------------------------------------
  it('debería cargar el usuario desde localStorage al iniciar', () => {
    store['userActual'] = JSON.stringify(mockUser);

    const newInstance = new AuthService();

    expect(newInstance.userActual).toEqual(mockUser);
  });

  // ---------------------------------------------------------------
  // LOGIN
  // ---------------------------------------------------------------
  it('debería guardar usuario en localStorage y actualizar BehaviorSubject al hacer login', () => {
    service.login(mockUser);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'userActual',
      JSON.stringify(mockUser)
    );

    expect(service.userActual).toEqual(mockUser);
  });

  // ---------------------------------------------------------------
  // LOGIN LOCAL
  // ---------------------------------------------------------------
  it('debería actualizar el usuario en localStorage con loginLocal', () => {
    const updatedUser = { ...mockUser, fullName: 'Nuevo Nombre' };

    service.loginLocal(updatedUser);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'userActual',
      JSON.stringify(updatedUser)
    );

    expect(service.userActual).toEqual(updatedUser);
  });

  // ---------------------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------------------
  it('debería eliminar el usuario y limpiar BehaviorSubject al hacer logout', () => {
    service.login(mockUser);

    service.logout();

    expect(localStorage.removeItem).toHaveBeenCalledWith('userActual');
    expect(service.userActual).toBeNull();
  });

  // ---------------------------------------------------------------
  // Helpers: isLogged
  // ---------------------------------------------------------------
  it('isLogged debería retornar true si hay usuario activo', () => {
    service.login(mockUser);
    expect(service.isLogged()).toBeTrue();
  });

  it('isLogged debería retornar false si no hay usuario', () => {
    service.logout();
    expect(service.isLogged()).toBeFalse();
  });

  // ---------------------------------------------------------------
  // Helpers: roles
  // ---------------------------------------------------------------
  it('isAdmin debería retornar true cuando rol = ADMIN', () => {
    service.login(mockUser);
    expect(service.isAdmin()).toBeTrue();
  });

  it('isLibrarian debería retornar true cuando rol = BIBLIOTECARIO', () => {
    const librarian: User = {
      id: 1,
      fullName: 'Test User',
      email: 'test@test.com',
      rol: 'TECNICO', // ahora TypeScript sabe que es literal correcto
    };
    service.login(librarian);
    expect(service.isTechnician()).toBeTrue();
  });

  it('getRole debería retornar null cuando no hay usuario logueado', () => {
    service.logout(); // o estado inicial

    const role = service.getRole();

    expect(role).toBeNull();
  });
});