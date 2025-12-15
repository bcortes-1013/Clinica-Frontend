import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SamplesService } from './samples.service';
import { environment } from '../../environments/environment';
import { Sample } from '../models/sample';

describe('SamplesService', () => {
  let service: SamplesService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiBaseUrl}/samples`;

  const mockSample: Sample = {
    id: 1,
    code: 'MUE-001',
    description: 'Muestra de sangre',
    technician: 'Juan Pérez',
    laboratory: 'Laboratorio Central'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SamplesService]
    });

    service = TestBed.inject(SamplesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // asegura que no queden requests pendientes
  });

  // ---------------------------------------------------------
  // getAll
  // ---------------------------------------------------------
  it('debería obtener todas las muestras', () => {
    service.getAll().subscribe(samples => {
      expect(samples.length).toBe(1);
      expect(samples).toEqual([mockSample]);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush([mockSample]);
  });

  // ---------------------------------------------------------
  // getById
  // ---------------------------------------------------------
  it('debería obtener una muestra por id', () => {
    service.getById(1).subscribe(sample => {
      expect(sample).toEqual(mockSample);
    });

    const req = httpMock.expectOne(`${apiUrl}/id/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSample);
  });

  // ---------------------------------------------------------
  // create
  // ---------------------------------------------------------
  it('debería crear una muestra', () => {
    const newSample: Omit<Sample, 'id'> = {
      code: 'MUE-002',
      description: 'Muestra de orina',
      technician: 'Ana Gómez',
      laboratory: 'Lab Norte',
    };

    service.create(newSample).subscribe(sample => {
      expect(sample).toEqual(mockSample);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newSample);
    req.flush(mockSample);
  });

  // ---------------------------------------------------------
  // update
  // ---------------------------------------------------------
  it('debería actualizar una muestra', () => {
    const updateData: Partial<Sample> = {
      description: 'Descripción actualizada'
    };

    service.update(1, updateData).subscribe(sample => {
      expect(sample).toEqual(mockSample);
    });

    const req = httpMock.expectOne(`${apiUrl}/id/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateData);
    req.flush(mockSample);
  });

  // ---------------------------------------------------------
  // delete
  // ---------------------------------------------------------
  it('debería eliminar una muestra', () => {
    service.delete(1).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${apiUrl}/id/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});