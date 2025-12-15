import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecoverComponent } from './recover.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UsersService } from 'src/app/services/users.service';
import { LoadingService } from 'src/app/services/loading.service';
import { of, throwError } from 'rxjs';

describe('RecoverComponent', () => {
  let component: RecoverComponent;
  let fixture: ComponentFixture<RecoverComponent>;
  let usersServiceMock: jasmine.SpyObj<UsersService>;
  let loadingServiceMock: jasmine.SpyObj<LoadingService>;

  beforeEach(() => {
    usersServiceMock = jasmine.createSpyObj('UsersService', ['recoverByEmail']);
    loadingServiceMock = jasmine.createSpyObj('LoadingService', ['show', 'hide']);

    TestBed.configureTestingModule({
      imports: [RecoverComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: UsersService, useValue: usersServiceMock },
        { provide: LoadingService, useValue: loadingServiceMock }
      ]
    });

    fixture = TestBed.createComponent(RecoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // -----------------------------------------------
  // COMPONENT CREATION
  // -----------------------------------------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // -----------------------------------------------
  // BRANCH 1: FORM INVALID
  // -----------------------------------------------
  it('debería mostrar mensaje de error si el formulario es inválido', () => {
    component.form.setValue({ email: '' }); // email inválido

    component.onSubmit();

    expect(component.mensajeError).toBe('Ingresa un correo válido');
    expect(loadingServiceMock.show).not.toHaveBeenCalled();
  });

  // -----------------------------------------------
  // BRANCH 2: LLAMADA EXITOSA
  // -----------------------------------------------
  it('debería mostrar mensajeOk cuando recoverByEmail retorna la contraseña', () => {
    component.form.setValue({ email: 'test@example.com' });

    usersServiceMock.recoverByEmail.and.returnValue(of('ABC123'));

    component.onSubmit();

    expect(loadingServiceMock.show).toHaveBeenCalled();
    expect(usersServiceMock.recoverByEmail).toHaveBeenCalledWith('test@example.com');
    expect(component.mensajeOk).toBe('Contraseña provisoria: ABC123');
    expect(component.mensajeError).toBeNull();
    expect(loadingServiceMock.hide).toHaveBeenCalled();
  });

  // -----------------------------------------------
  // BRANCH 3: ERROR DEL SERVICIO
  // -----------------------------------------------
  it('debería manejar error del servicio y mostrar mensajeError', () => {
    component.form.setValue({ email: 'test@example.com' });

    usersServiceMock.recoverByEmail.and.returnValue(
      throwError(() => new Error('Usuario no encontrado'))
    );

    component.onSubmit();

    expect(loadingServiceMock.show).toHaveBeenCalled();
    expect(component.mensajeError).toBe('Error al buscar el usuario');
    expect(component.mensajeOk).toBeNull();
    expect(loadingServiceMock.hide).toHaveBeenCalled();
  });
});