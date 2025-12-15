import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminComponent } from './admin.component';
import { UsersService } from 'src/app/services/users.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let usersServiceMock: any;
  let router: Router;

  beforeEach(() => {
    usersServiceMock = {
      getAllUsers: jasmine.createSpy('getAllUsers'),
      deleteUser: jasmine.createSpy('deleteUser')
    };

    TestBed.configureTestingModule({
      imports: [AdminComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: UsersService, useValue: usersServiceMock },
        { provide: AuthService, useValue: { isAdmin: () => true } }
      ]
    });

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  // -------------------------------------------------------------
  // CREATE
  // -------------------------------------------------------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // -------------------------------------------------------------
  // ngOnInit success
  // -------------------------------------------------------------
  it('debería cargar usuarios correctamente en ngOnInit', () => {
    const fakeUsers = [
      { id: 1, fullName: 'Juan' },
      { id: 2, fullName: 'Pedro' }
    ] as any;

    usersServiceMock.getAllUsers.and.returnValue(of(fakeUsers));

    fixture.detectChanges(); // ejecuta ngOnInit

    expect(component.users).toEqual(fakeUsers);
    expect(component.loading).toBeFalse();
    expect(component.error).toBe('');
  });

  // -------------------------------------------------------------
  // ngOnInit error
  // -------------------------------------------------------------
  it('debería manejar error al cargar usuarios', () => {
    usersServiceMock.getAllUsers.and.returnValue(throwError(() => ({ status: 500 })));

    fixture.detectChanges();

    expect(component.error).toBe('No se pudieron cargar los usuarios');
    expect(component.loading).toBeFalse();
  });

  // -------------------------------------------------------------
  // deleteUser sin ID
  // -------------------------------------------------------------
  it('no debería hacer nada si deleteUser recibe id undefined', () => {
    component.deleteUser(undefined);
    expect(usersServiceMock.deleteUser).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------
  // deleteUser confirm = false
  // -------------------------------------------------------------
  it('no debería eliminar si el usuario cancela el confirm', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteUser(1);

    expect(usersServiceMock.deleteUser).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------
  // deleteUser confirm = true (success)
  // -------------------------------------------------------------
  it('debería eliminar usuario cuando confirm = true y el servicio responde OK', () => {
    component.users = [
      { id: 1, fullName: 'Juan' },
      { id: 2, fullName: 'Pedro' }
    ] as any;

    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');

    usersServiceMock.deleteUser.and.returnValue(of({}));

    component.deleteUser(1);

    expect(usersServiceMock.deleteUser).toHaveBeenCalledWith(1);
    expect(component.users.length).toBe(1);
    expect(component.users[0].id).toBe(2);
    expect(window.alert).toHaveBeenCalledWith('✅ Usuario eliminado correctamente');
  });

  // -------------------------------------------------------------
  // deleteUser confirm = true (error)
  // -------------------------------------------------------------
  it('debería mostrar error si deleteUser falla', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');

    usersServiceMock.deleteUser.and.returnValue(throwError(() => ({ status: 500 })));

    component.deleteUser(1);

    expect(window.alert).toHaveBeenCalledWith('No se pudo eliminar el usuario');
  });

  // -------------------------------------------------------------
  // editProfile con ID
  // -------------------------------------------------------------
  it('debería navegar a /profile/:id cuando editProfile recibe ID', () => {
    const navSpy = spyOn(router, 'navigate');

    component.editProfile(10);

    expect(navSpy).toHaveBeenCalledWith(['/profile', 10]);
  });

  // -------------------------------------------------------------
  // editProfile sin ID
  // -------------------------------------------------------------
  it('debería mostrar warning cuando editProfile recibe undefined', () => {
    spyOn(console, 'warn');

    component.editProfile(undefined);

    expect(console.warn).toHaveBeenCalledWith('No hay ID para navegar');
  });

  // -------------------------------------------------------------
  // createUser
  // -------------------------------------------------------------
  it('debería navegar a /register al crear un usuario', () => {
    const navSpy = spyOn(router, 'navigate');

    component.createUser();

    expect(navSpy).toHaveBeenCalledWith(['/register']);
  });
});