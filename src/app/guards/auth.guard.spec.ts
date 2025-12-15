import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {

  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['isLogged']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  it('debería redirigir a /login y retornar false si el usuario NO está logueado', () => {
    authServiceSpy.isLogged.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      AuthGuard({} as any, {} as any)
    );

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    expect(result).toBeFalse();
  });

  it('debería permitir el acceso si el usuario está logueado', () => {
    authServiceSpy.isLogged.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      AuthGuard({} as any, {} as any)
    );

    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(result).toBeTrue();
  });

});