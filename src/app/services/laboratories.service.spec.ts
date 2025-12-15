import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { LaboratoriesService } from './laboratories.service';
import { environment } from '../../environments/environment';
import { Laboratory } from '../models/laboratory';

describe('LaboratoriesService', () => {
  let service: LaboratoriesService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiBaseUrl}/laboratories`;

  const mockLaboratory: Laboratory = {
    id: 1,
    name: 'Laboratorio Central',
    description: 'Hemotología',
    state: 'ACTIVO'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LaboratoriesService]
    });

    service = TestBed.inject(LaboratoriesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verifica que no queden requests pendientes
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ---------------------------------------------------------
  // GET ALL
  // ---------------------------------------------------------
  it('debería obtener todos los laboratorio', () => {
    const mockResponse: Laboratory[] = [mockLaboratory];

    service.getAll().subscribe(data => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);
  });

  // ---------------------------------------------------------
  // GET BY ID
  // ---------------------------------------------------------
  it('debería obtener un laboratorio por id', () => {
    service.getById(1).subscribe(data => {
      expect(data).toEqual(mockLaboratory);
    });

    const req = httpMock.expectOne(`${apiUrl}/id/1`);
    expect(req.request.method).toBe('GET');

    req.flush(mockLaboratory);
  });

  // ---------------------------------------------------------
  // CREATE
  // ---------------------------------------------------------
  it('debería crear un laboratorio', () => {
    const payload: Omit<Laboratory, 'id'> = {
      name: 'Nuevo Lab',
      description: 'Hemotología',
      state: 'ACTIVO'
    };

    service.create(payload).subscribe(data => {
      expect(data).toEqual(mockLaboratory);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush(mockLaboratory);
  });

  // ---------------------------------------------------------
  // UPDATE
  // ---------------------------------------------------------
  it('debería actualizar un laboratorio', () => {
    const payload: Partial<Laboratory> = {
      name: 'Lab Actualizado'
    };

    service.update(1, payload).subscribe(data => {
      expect(data).toEqual(mockLaboratory);
    });

    const req = httpMock.expectOne(`${apiUrl}/id/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);

    req.flush(mockLaboratory);
  });

  // ---------------------------------------------------------
  // DELETE
  // ---------------------------------------------------------
  it('debería eliminar un laboratorio', () => {
    service.delete(1).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${apiUrl}/id/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});