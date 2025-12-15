import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { UsersService } from '../../../services/users.service';
import { LoadingService } from '../../../services/loading.service';
import { AuthService } from 'src/app/services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormBuilder } from '@angular/forms';

describe('RegisterComponent', () => {

  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  // Mocks de servicios
  const usersServiceMock = {
    register: jasmine.createSpy('register')
  };

  const loadingServiceMock = {
    show: jasmine.createSpy('show'),
    hide: jasmine.createSpy('hide')
  };

  const authServiceMock = {
    isAdmin: jasmine.createSpy('isAdmin').and.returnValue(false)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: UsersService, useValue: usersServiceMock },
        { provide: LoadingService, useValue: loadingServiceMock },
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ---------------------------------------------------------------
  // TEST 1: El componente se crea
  // ---------------------------------------------------------------
  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  // ---------------------------------------------------------------
  // TEST 2: El formulario es inválido si falta info
  // ---------------------------------------------------------------
  it('debería marcar error si el formulario es inválido', () => {
    component.form.patchValue({
      fullName: '',
      email: '',
      password: '',
      password2: ''
    });

    component.onSubmit();

    expect(component.mensajeError).toBe('Completa los campos requeridos');
    expect(loadingServiceMock.hide).toHaveBeenCalled();
  });

  // ---------------------------------------------------------------
  // TEST 3: Registro exitoso
  // ---------------------------------------------------------------
  it('debería registrar correctamente cuando el formulario es válido', () => {
    usersServiceMock.register.and.returnValue(of({ id: 1 }));
    authServiceMock.isAdmin.and.returnValue(false);

    component.form.setValue({
      fullName: 'Juan Perez',
      email: 'juan@test.com',
      password: '123456',
      password2: '123456',
      phone: '987654321'
    });

    component.onSubmit();

    expect(component.cargando).toBeFalse();
    expect(component.mensajeOk).toEqual('Te has registrado correctamente. Ahora puedes iniciar sesión');
    expect(loadingServiceMock.hide).toHaveBeenCalled();

    expect(usersServiceMock.register).toHaveBeenCalledWith({
      fullName: 'Juan Perez',
      email: 'juan@test.com',
      password: '123456',
      phone: '987654321',
      rol: 'PACIENTE'
    });
  });

  // ---------------------------------------------------------------
  // TEST 4: Error en el registro
  // ---------------------------------------------------------------
  it('debería manejar error en registro', () => {
    usersServiceMock.register.and.returnValue(throwError(() => new Error('fail')));

    component.form.setValue({
      fullName: 'Juan Perez',
      email: 'juan@test.com',
      password: '123456',
      password2: '123456',
      phone: '987654321'
    });

    component.onSubmit();

    expect(component.mensajeError).toBe('No fue posible registrar el usuario. Verifique el email (no repetido)');
    expect(component.cargando).toBeFalse();
    expect(loadingServiceMock.hide).toHaveBeenCalled();
  });

  // ---------------------------------------------------------------
  // TEST 5: Validador checkSamePasswords
  // ---------------------------------------------------------------
  it('debería marcar error cuando las contraseñas no coinciden', () => {
    const validator = component.checkSamePasswords('password', 'password2');

    component.form.patchValue({
      password: '123456',
      password2: '111111'
    });

    validator(component.form);

    const error = component.form.get('password2')?.errors;
    expect(error?.['contrasenasNoCoinciden']).toBeTrue();
  });

  it('debería limpiar el error cuando las contraseñas coinciden', () => {
    const validator = component.checkSamePasswords('password', 'password2');

    component.form.patchValue({
      password: '123456',
      password2: '111111'
    });
    validator(component.form);

    // Ahora emparejar
    component.form.patchValue({
      password2: '123456'
    });
    validator(component.form);

    expect(component.form.get('password2')?.errors).toBeNull();
  });

  it('debería registrar rol = "TECNICO" cuando isAdmin es true', () => {
    authServiceMock.isAdmin.and.returnValue(true);

    component.form.setValue({
      fullName: 'Carlos',
      email: 'c@test.com',
      password: '123456',
      password2: '123456',
      phone: '123456789'
    });

    usersServiceMock.register.and.returnValue(of({}));

    component.onSubmit();

    expect(usersServiceMock.register).toHaveBeenCalledWith(jasmine.objectContaining({
      rol: 'TECNICO'
    }));
  });

  it('debería enviar phone = "" cuando el campo viene vacío', () => {
    authServiceMock.isAdmin.and.returnValue(true);

    component.form.patchValue({
      fullName: 'Juan Pérez',
      email: 'juan@test.com',
      password: '123456',
      password2: '123456',
      phone: null
    });

    usersServiceMock.register.and.returnValue(of({}));

    component.onSubmit();

    expect(usersServiceMock.register).toHaveBeenCalledWith(jasmine.objectContaining({
      phone: ''
    }));
  });

  it('no debe limpiar todos los errores si queda otro error distinto en password2', () => {
    const validator = component.checkSamePasswords('password', 'password2');

    const form = new FormBuilder().group({
      password: ['123456'],
      password2: ['123456']
    });

    // Simular errores previos: uno será eliminado, otro debe quedar
    form.get('password2')?.setErrors({ 
      required: true, 
      contrasenasNoCoinciden: true 
    });

    validator(form);

    const errors = form.get('password2')?.errors;

    // Debe existir SOLO el error "required"
    expect(errors).toEqual({ required: true });
  });

  it('debe limpiar todos los errores cuando solo existía contrasenasNoCoinciden y las contraseñas coinciden', () => {
    const validator = component.checkSamePasswords('password', 'password2');

    const form = new FormBuilder().group({
      password: ['123456'],
      password2: ['123456']
    });

    // Solo este error → después de borrarlo no queda ninguno
    form.get('password2')?.setErrors({ 
      contrasenasNoCoinciden: true 
    });

    validator(form);

    const errors = form.get('password2')?.errors;

    expect(errors).toBeNull(); // Aquí sí debe ser null
  });
});