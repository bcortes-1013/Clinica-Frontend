import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { RoleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let route: ActivatedRouteSnapshot;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getRole']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(RoleGuard);

    route = new ActivatedRouteSnapshot();
    route.data = { roles: ['ADMIN', 'TECNICO'] };
  });

  it('debería permitir el acceso cuando el rol está incluido', () => {
    authServiceSpy.getRole.and.returnValue('ADMIN');

    const result = guard.canActivate(route);

    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('debería redirigir y retornar false cuando el rol no está incluido', () => {
    authServiceSpy.getRole.and.returnValue('USUARIO');

    const result = guard.canActivate(route);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('debería redirigir y retornar false cuando el rol es null', () => {
    authServiceSpy.getRole.and.returnValue(null);

    const result = guard.canActivate(route);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });
});