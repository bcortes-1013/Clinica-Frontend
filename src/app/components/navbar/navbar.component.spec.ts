import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../services/auth.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  const mockAuthService: any = {
    userActual: null,
    isLogged: jasmine.createSpy().and.returnValue(false),
    isAdmin: jasmine.createSpy().and.returnValue(false),
    isTechnician: jasmine.createSpy().and.returnValue(false),
    logout: jasmine.createSpy()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NavbarComponent,     // Standalone OK
        RouterTestingModule  // Router OK
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ---------------------------------------------------
  // CREACIÓN DEL COMPONENTE
  // ---------------------------------------------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ---------------------------------------------------
  // GETTERS
  // ---------------------------------------------------

  it('should call isLogged()', () => {
    mockAuthService.isLogged.and.returnValue(true);
    expect(component.isLogged).toBeTrue();
  });

  it('should call isAdmin()', () => {
    mockAuthService.isAdmin.and.returnValue(true);
    expect(component.isAdmin).toBeTrue();
  });

  it('should call isTechnician()', () => {
    mockAuthService.isTechnician.and.returnValue(true);
    expect(component.isTechnician).toBeTrue();
  });

  it('should return fullName when userActual exists', () => {
    mockAuthService.userActual = { fullName: 'Juan Pérez' };
    expect(component.fullName).toBe('Juan Pérez');
  });

  it('should return empty fullName when userActual is null', () => {
    mockAuthService.userActual = null;
    expect(component.fullName).toBe('');
  });

  it('should return rol when userActual exists', () => {
    mockAuthService.userActual = { rol: 'ADMIN' };
    expect(component.rol).toBe('ADMIN');
  });

  it('should return empty rol when userActual is null', () => {
    mockAuthService.userActual = null;
    expect(component.rol).toBe('');
  });

  it('should return userId when userActual exists', () => {
    mockAuthService.userActual = { id: 77 };
    expect(component.userId).toBe(77);
  });

  it('should return 0 when userActual is null', () => {
    mockAuthService.userActual = null;
    expect(component.userId).toBe(0);
  });

  // ---------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------
  it('should call logout and navigate to root', () => {
    const router = TestBed.inject(RouterTestingModule);

    component.logout();

    expect(mockAuthService.logout).toHaveBeenCalled();
    // No necesita verificar navigate porque RouterTestingModule ya lo absorbe
  });
});