import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UsersService } from 'src/app/services/users.service';
import { LoadingService } from 'src/app/services/loading.service';
import { AuthService } from 'src/app/services/auth.service';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  let usersServiceMock: any;
  let loadingServiceMock: any;
  let authServiceMock: any;
  let routerMock: any;

  // Mock dinámico del ActivatedRoute
  let routeMock: any = {
    snapshot: {
      paramMap: convertToParamMap({ id: '1' })
    }
  };

  beforeEach(() => {
    usersServiceMock = {
      getById: jasmine.createSpy('getById'),
      updateProfile: jasmine.createSpy('updateProfile')
    };

    loadingServiceMock = {
      show: jasmine.createSpy('show'),
      hide: jasmine.createSpy('hide')
    };

    authServiceMock = {
      isAdmin: jasmine.createSpy('isAdmin').and.returnValue(false)
    };

    routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    TestBed.configureTestingModule({
      imports: [ProfileComponent, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: UsersService, useValue: usersServiceMock },
        { provide: LoadingService, useValue: loadingServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  // -----------------------------------
  // TESTS
  // -----------------------------------

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ------- ngOnInit ---------

  it('ngOnInit debería marcar error si id es inválido', () => {
    routeMock.snapshot.paramMap = convertToParamMap({ id: null });

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.mensajeError).toBe('ID de usuario inválido');
    expect(component.loading).toBeFalse();
  });

  it('ngOnInit debería cargar usuario exitosamente', () => {
    routeMock.snapshot.paramMap = convertToParamMap({ id: '1' });

    usersServiceMock.getById.and.returnValue(
      of({
        id: 1,
        fullName: 'Juan',
        email: 'j@test.com',
        phone: '123456789',
        rol: 'admin'
      })
    );

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.user?.fullName).toBe('Juan');
    expect(component.loading).toBeFalse();
    expect(component.form.value.fullName).toBe('Juan');
  });

  it('ngOnInit debería manejar error en getById', () => {
    routeMock.snapshot.paramMap = convertToParamMap({ id: '1' });

    usersServiceMock.getById.and.returnValue(
      throwError(() => new Error('err'))
    );

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.mensajeError).toBe('No se pudo obtener el usuario');
    expect(component.loading).toBeFalse();
  });

  // ------- onSubmit ---------

  it('onSubmit debe mostrar error si el formulario es inválido', () => {
    component.form.setValue({
      fullName: '',
      email: '',
      phone: ''
    });

    component.onSubmit();

    expect(component.mensajeError).toBe('Completa los campos requeridos');
    expect(loadingServiceMock.hide).toHaveBeenCalled();
  });

  // it('onSubmit debe marcar error si faltan fullName o email', () => {
  //   component.form.setValue({
  //     fullName: '',
  //     email: '',
  //     phone: ''
  //   });

  //   component.onSubmit();

  //   expect(component.mensajeError)
  //     .toBe('Nombre, email y contraseña son obligatorios');
  //   expect(loadingServiceMock.hide).toHaveBeenCalled();
  // });

  it('onSubmit debe actualizar usuario (no admin)', () => {
    component.userId = 1;
    authServiceMock.isAdmin.and.returnValue(false);

    component.form.setValue({
      fullName: 'Juan',
      email: 'j@test.com',
      phone: '123456789'
    });

    usersServiceMock.updateProfile.and.returnValue(of({}));

    component.onSubmit();

    expect(usersServiceMock.updateProfile).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });

  it('onSubmit debe actualizar usuario (admin)', () => {
    component.userId = 1;
    authServiceMock.isAdmin.and.returnValue(true);

    component.form.setValue({
      fullName: 'Juan',
      email: 'j@test.com',
      phone: '123456789'
    });

    usersServiceMock.updateProfile.and.returnValue(of({}));

    component.onSubmit();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('onSubmit debe manejar error en updateProfile', () => {
    component.userId = 1;

    component.form.setValue({
      fullName: 'Juan',
      email: 'j@test.com',
      phone: '123456789'
    });

    usersServiceMock.updateProfile.and.returnValue(
      throwError(() => new Error('Error'))
    );

    component.onSubmit();

    expect(component.mensajeError).toBe('Error al actualizar el usuario');
    expect(loadingServiceMock.hide).toHaveBeenCalled();
  });

  it('no debería llamar updateProfile si fullName es null', () => {
    component.userId = 1;
    component.user = { id: 1, rol: 'PACIENTE' } as any;

    component.form.setValue({
      fullName: null,
      email: 'test@test.com',
      phone: '987654321'
    });

    component.onSubmit();

    expect(usersServiceMock.updateProfile).not.toHaveBeenCalled();
  });

  it('no debería llamar updateProfile si email es undefined', () => {
    component.userId = 1;
    component.user = { id: 1, rol: 'PACIENTE' } as any;

    component.form.patchValue({
      fullName: 'Juan Perez',
      email: undefined,
      phone: '987654321'
    });

    component.onSubmit();

    expect(usersServiceMock.updateProfile).not.toHaveBeenCalled();
  });

  it('onSubmit debería enviar phone = undefined cuando viene null', () => {
    component.userId = 1;

    component.form.setValue({
      fullName: 'Juan',
      email: 'test@test.com',
      phone: null as any
    });

    usersServiceMock.updateProfile.and.returnValue(of({}));

    component.onSubmit();

    const payload = usersServiceMock.updateProfile.calls.mostRecent().args[1];

    expect(payload.phone).toBeUndefined();
  });
});