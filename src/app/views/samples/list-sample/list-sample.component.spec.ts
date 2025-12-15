import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListSampleComponent } from './list-sample.component';
import { SamplesService } from 'src/app/services/samples.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Sample } from 'src/app/models/sample';

describe('ListSampleComponent', () => {
  let component: ListSampleComponent;
  let fixture: ComponentFixture<ListSampleComponent>;
  let samplesServiceSpy: jasmine.SpyObj<SamplesService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockSamples: Sample[] = [
    {
      id: 1,
      code: 'MUE-001',
      description: 'Muestra 1',
      technician: 'Juan',
      laboratory: 'Lab 1'
    },
    {
      id: 2,
      code: 'MUE-002',
      description: 'Muestra 2',
      technician: 'Pedro',
      laboratory: 'Lab 2'
    }
  ];

  beforeEach(async () => {
    samplesServiceSpy = jasmine.createSpyObj('SamplesService', ['getAll', 'delete']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ListSampleComponent],
      providers: [
        { provide: SamplesService, useValue: samplesServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListSampleComponent);
    component = fixture.componentInstance;
  });

  // -------------------- ngOnInit --------------------

  it('ngOnInit debería cargar las muestras correctamente', () => {
    samplesServiceSpy.getAll.and.returnValue(of(mockSamples));

    component.ngOnInit();

    expect(component.samples.length).toBe(2);
    expect(component.loading).toBeFalse();
  });

  it('ngOnInit debería mostrar error si falla la carga', () => {
    samplesServiceSpy.getAll.and.returnValue(throwError(() => new Error()));

    component.ngOnInit();

    expect(component.error).toBe('No se pudieron cargar las muestras');
    expect(component.loading).toBeFalse();
  });

  // -------------------- deleteSample --------------------

  it('deleteSample no debería hacer nada si id es undefined', () => {
    component.deleteSample(undefined);

    expect(samplesServiceSpy.delete).not.toHaveBeenCalled();
  });

  it('deleteSample no debería eliminar si el usuario cancela', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteSample(1);

    expect(samplesServiceSpy.delete).not.toHaveBeenCalled();
  });

  it('deleteSample debería eliminar la muestra cuando el usuario confirma', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');

    component.samples = [...mockSamples];
    samplesServiceSpy.delete.and.returnValue(of(void 0));

    component.deleteSample(1);

    expect(samplesServiceSpy.delete).toHaveBeenCalledWith(1);
    expect(component.samples.length).toBe(1);
    expect(component.samples.find(s => s.id === 1)).toBeUndefined();
  });

  it('deleteSample debería mostrar alerta si falla la eliminación', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');

    samplesServiceSpy.delete.and.returnValue(throwError(() => new Error()));

    component.deleteSample(1);

    expect(window.alert).toHaveBeenCalledWith('No se pudo eliminar la muestra');
  });

  // -------------------- editSample --------------------

  it('editSample debería navegar al editar cuando hay id', () => {
    component.editSample(5);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/samples/edit', 5]);
  });

  it('editSample no debería navegar cuando id es undefined', () => {
    component.editSample(undefined);

    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  // -------------------- createSample --------------------

  it('createSample debería navegar a crear muestra', () => {
    component.createSample();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/samples/create']);
  });
});