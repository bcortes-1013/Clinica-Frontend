import { TestBed } from '@angular/core/testing';
import { UsersService } from './users.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { User } from '../models/user';

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiBaseUrl}/users`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // -------------------------------------------------------------
  // LOGIN
  // -------------------------------------------------------------
  it('debería llamar login con POST y enviar email/password', () => {
    const fakeUser = { id: 1, email: 'test@test.com' } as User;

    service.login('test@test.com', '1234').subscribe(res => {
      expect(res).toEqual(fakeUser);
    });

    const req = httpMock.expectOne(`${apiUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@test.com', password: '1234' });

    req.flush(fakeUser);
  });

  // -------------------------------------------------------------
  // REGISTER
  // -------------------------------------------------------------
  it('debería registrar usuario correctamente', () => {
    const user: User = { id: 1, fullName: 'Juan', email: 'a@a.com', rol: 'PACIENTE', password: '1234' };

    service.register(user).subscribe(res => {
      expect(res).toEqual(user);
    });

    const req = httpMock.expectOne(`${apiUrl}/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(user);

    req.flush(user);
  });

  // -------------------------------------------------------------
  // RECOVER
  // -------------------------------------------------------------
  it('debería recuperar contraseña por email usando GET con responseType text', () => {
    const pwd = 'pass-temp';

    service.recoverByEmail('test@test.com').subscribe(res => {
      expect(res).toBe(pwd);
    });

    const req = httpMock.expectOne(`${apiUrl}/recover/test@test.com`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('text');

    req.flush(pwd);
  });

  // -------------------------------------------------------------
  // GET BY ID
  // -------------------------------------------------------------
  it('debería obtener usuario por ID', () => {
    const fakeUser = { id: 10, fullName: 'Test' } as User;

    service.getById(10).subscribe(res => {
      expect(res).toEqual(fakeUser);
    });

    const req = httpMock.expectOne(`${apiUrl}/id/10`);
    expect(req.request.method).toBe('GET');

    req.flush(fakeUser);
  });

  // -------------------------------------------------------------
  // UPDATE PROFILE
  // -------------------------------------------------------------
  it('debería actualizar perfil usando PUT', () => {
    const updateData = { fullName: 'Nuevo Nombre' };
    const fakeResponse = { id: 1, fullName: 'Nuevo Nombre' } as User;

    service.updateProfile(1, updateData).subscribe(res => {
      expect(res).toEqual(fakeResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/profile/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateData);

    req.flush(fakeResponse);
  });

  // -------------------------------------------------------------
  // DELETE USER
  // -------------------------------------------------------------
  it('debería eliminar un usuario con DELETE', () => {
    service.deleteUser(5).subscribe(res => {
      expect(res).toBeNull();
    });

    const req = httpMock.expectOne(`${apiUrl}/delete/5`);
    expect(req.request.method).toBe('DELETE');

    req.flush(null);
  });

  // -------------------------------------------------------------
  // GET ALL USERS
  // -------------------------------------------------------------
  it('debería obtener todos los usuarios', () => {
    const fakeList: User[] = [
      { id: 1, fullName: 'Juan', email: 'j@j.com', rol: 'TECNICO' },
      { id: 2, fullName: 'Ana', email: 'a@a.com', rol: 'ADMIN' }
    ];

    service.getAllUsers().subscribe(res => {
      expect(res.length).toBe(2);
      expect(res).toEqual(fakeList);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');

    req.flush(fakeList);
  });
});