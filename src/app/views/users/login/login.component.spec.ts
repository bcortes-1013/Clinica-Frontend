import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UsersService } from '../../../services/users.service';
import { AuthService } from '../../../services/auth.service';
import { LoadingService } from '../../../services/loading.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';

describe('LoginComponent', () => {

  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  let usersServiceMock: jasmine.SpyObj<UsersService>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let loadingServiceMock: jasmine.SpyObj<LoadingService>;
  let router: Router;

  beforeEach(() => {
    // mocks bien construidos
    usersServiceMock = jasmine.createSpyObj('UsersService', ['login']);
    authServiceMock = jasmine.createSpyObj('AuthService', ['login']);
    loadingServiceMock = jasmine.createSpyObj('LoadingService', ['show', 'hide']);

    TestBed.configureTestingModule({
      // importante: incluir RouterTestingModule (no usar solo Router mock)
      imports: [LoginComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: UsersService, useValue: usersServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: LoadingService, useValue: loadingServiceMock }
        // no es necesario proveer Router: RouterTestingModule ya lo hace
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar error si el formulario es inválido', () => {
    component.form.setValue({ email: '', password: '' });

    component.onSubmit();

    expect(component.mensajeError).toBe('Completa el formulario');
    expect(loadingServiceMock.hide).toHaveBeenCalled();
    expect(usersServiceMock.login).not.toHaveBeenCalled();
  });

  it('debería mostrar error si falta email', () => {
    component.form.patchValue({ email: undefined, password: '1234' });
    // forzamos controles como "no error" para simular flujo
    component.form.get('email')?.setErrors(null);
    component.form.get('password')?.setErrors(null);

    component.onSubmit();

    expect(component.mensajeError).toBe('Email y contraseña obligatorios');
    expect(usersServiceMock.login).not.toHaveBeenCalled();
  });

  it('debería mostrar error si falta password', () => {
    component.form.patchValue({ email: 'test@test.com', password: undefined });
    component.form.get('email')?.setErrors(null);
    component.form.get('password')?.setErrors(null);

    component.onSubmit();

    expect(component.mensajeError).toBe('Email y contraseña obligatorios');
    expect(usersServiceMock.login).not.toHaveBeenCalled();
  });

  it('debería loguear y navegar al home cuando login es exitoso', () => {
    const fakeUser = {
      id: 1,
      fullName: 'Juan',
      email: 'juan@test.com',
      rol: 'USER',
      phone: '123456789'
    } as any;
    usersServiceMock.login.and.returnValue(of(fakeUser));

    spyOn(router, 'navigate');

    component.form.setValue({
      email: 'test@test.com',
      password: '1234'
    });

    component.onSubmit();

    expect(usersServiceMock.login).toHaveBeenCalledWith('test@test.com', '1234');
    expect(authServiceMock.login).toHaveBeenCalledWith(fakeUser);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(loadingServiceMock.hide).toHaveBeenCalled();
  });

  it('debería mostrar error de conexión si el error.status es 0', () => {
    usersServiceMock.login.and.returnValue(throwError({ status: 0 }));

    component.form.setValue({
      email: 'test@test.com',
      password: '1234'
    });

    component.onSubmit();

    expect(component.mensajeError).toBe('Error en la conexión, intenta más tarde');
    expect(loadingServiceMock.hide).toHaveBeenCalled();
  });

  it('debería mostrar mensaje del servidor si viene err.error.error', () => {
    usersServiceMock.login.and.returnValue(throwError({
      status: 500,
      error: { error: 'Credenciales inválidas' }
    }));

    component.form.setValue({
      email: 'test@test.com',
      password: '1234'
    });

    component.onSubmit();

    expect(component.mensajeError).toBe('Credenciales inválidas');
    expect(loadingServiceMock.hide).toHaveBeenCalled();
  });

  it('debería mostrar "Error en el servidor" si no llega mensaje específico', () => {
    usersServiceMock.login.and.returnValue(throwError({
      status: 500,
      error: {}
    }));

    component.form.setValue({
      email: 'test@test.com',
      password: '1234'
    });

    component.onSubmit();

    expect(component.mensajeError).toBe('Error en el servidor');
    expect(loadingServiceMock.hide).toHaveBeenCalled();
  });
});