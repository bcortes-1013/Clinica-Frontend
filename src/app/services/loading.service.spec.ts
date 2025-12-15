import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  it('deber;ia emitir falso por defecto', (done) => {
    service.loading$.subscribe(value => {
      expect(value).toBeFalse();
      done();
    });
  });

  it('debería emitir true cuando show() es llamado', (done) => {
    const values: boolean[] = [];

    service.loading$.subscribe(value => {
      values.push(value);

      // Esperamos el segundo valor (después del show)
      if (values.length === 2) {
        expect(values).toEqual([false, true]);
        done();
      }
    });

    service.show();
  });

  it('deberia emitir falso cuando hide() es llamado después de show()', (done) => {
    const values: boolean[] = [];

    service.loading$.subscribe(value => {
      values.push(value);

      if (values.length === 3) {
        expect(values).toEqual([false, true, false]);
        done();
      }
    });

    service.show();
    service.hide();
  });

  it('debería emitir falso cuando hide() es llamado directamente', (done) => {
    const values: boolean[] = [];

    service.loading$.subscribe(value => {
      values.push(value);

      if (values.length === 2) {
        expect(values).toEqual([false, false]);
        done();
      }
    });

    service.hide();
  });
});