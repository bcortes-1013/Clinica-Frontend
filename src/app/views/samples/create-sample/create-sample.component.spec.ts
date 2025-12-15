import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateSampleComponent } from './create-sample.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { LaboratoriesService } from 'src/app/services/laboratories.service';
import { SamplesService } from 'src/app/services/samples.service';
import { LoadingService } from 'src/app/services/loading.service';
import { AuthService } from 'src/app/services/auth.service';
import { Laboratory } from 'src/app/models/laboratory';
import { Sample } from 'src/app/models/sample';

describe('CreateSampleComponent', () => {
  let component: CreateSampleComponent;
  let fixture: ComponentFixture<CreateSampleComponent>;

  let laboratoriesServiceSpy: jasmine.SpyObj<LaboratoriesService>;
  let samplesServiceSpy: jasmine.SpyObj<SamplesService>;
  let loadingServiceSpy: jasmine.SpyObj<LoadingService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockLaboratories: Laboratory[] = [
    { id: 1, name: 'Lab Central', description: 'Principal', state: 'ACTIVO' }
  ];

  const mockSample: Sample = {
    id: 1,
    code: 'MUE-001',
    description: 'Muestra de sangre',
    technician: 'Juan Pérez',
    laboratory: 'Lab Central'
  };

  beforeEach(async () => {
    laboratoriesServiceSpy = jasmine.createSpyObj('LaboratoriesService', ['getAll']);
    samplesServiceSpy = jasmine.createSpyObj('SamplesService', ['create']);
    loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['show', 'hide']);
    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      userActual: { fullName: 'Juan Pérez' }
    });

    await TestBed.configureTestingModule({
      imports: [
        CreateSampleComponent,
        ReactiveFormsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: LaboratoriesService, useValue: laboratoriesServiceSpy },
        { provide: SamplesService, useValue: samplesServiceSpy },
        { provide: LoadingService, useValue: loadingServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateSampleComponent);
    component = fixture.componentInstance;
  });

  // ---------------------------------------------------------
  // ngOnInit
  // ---------------------------------------------------------
  it('ngOnInit debería cargar los laboratorios correctamente', () => {
    laboratoriesServiceSpy.getAll.and.returnValue(of(mockLaboratories));

    component.ngOnInit();

    expect(component.laboratories).toEqual(mockLaboratories);
    expect(component.loading).toBeFalse();
  });

  it('ngOnInit debería mostrar error si falla la carga de laboratorios', () => {
    laboratoriesServiceSpy.getAll.and.returnValue(throwError(() => new Error('Error')));

    component.ngOnInit();

    expect(component.mensajeError).toBe('No se pudieron cargar los laboratorios');
    expect(component.loading).toBeFalse();
  });

  // ---------------------------------------------------------
  // onSubmit - formulario inválido
  // ---------------------------------------------------------
  it('onSubmit debería mostrar error si el formulario es inválido', () => {
    component.form.setValue({
      code: '',
      description: '',
      laboratory: null
    });

    component.onSubmit();

    expect(component.mensajeError).toBe('Completa los campos requeridos');
    expect(loadingServiceSpy.hide).toHaveBeenCalled();
    expect(samplesServiceSpy.create).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------
  // onSubmit - laboratorio no encontrado (branch del find)
  // ---------------------------------------------------------
  it('onSubmit debería enviar laboratory vacío si no encuentra el laboratorio', () => {
    laboratoriesServiceSpy.getAll.and.returnValue(of([]));
    samplesServiceSpy.create.and.returnValue(of(mockSample));

    component.laboratories = []; // fuerza branch del find
    component.form.setValue({
      code: 'MUE-001',
      description: 'Descripción',
      laboratory: 1
    });

    component.onSubmit();

    expect(samplesServiceSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      laboratory: ''
    }));
  });

  // ---------------------------------------------------------
  // onSubmit - éxito
  // ---------------------------------------------------------
  it('onSubmit debería crear la muestra correctamente cuando el formulario es válido', () => {
    // arrange
    samplesServiceSpy.create.and.returnValue(of(mockSample));
    component.laboratories = mockLaboratories;

    component.form.setValue({
      code: 'MUE-001',
      description: 'Muestra de sangre',
      laboratory: 1
    });

    // act
    component.onSubmit();

    // assert
    expect(samplesServiceSpy.create).toHaveBeenCalledWith(
      jasmine.objectContaining({
        code: 'MUE-001',
        description: 'Muestra de sangre',
        technician: 'Juan Pérez',
        laboratory: 'Lab Central'
      })
    );

    expect(component.mensajeOk).toContain('Se ha registrado la muestra');
    expect(loadingServiceSpy.hide).toHaveBeenCalled();
  });


  // // ---------------------------------------------------------
  // // onSubmit - error del servicio
  // // ---------------------------------------------------------
  it('onSubmit debería mostrar mensaje de error si falla la creación', () => {
    samplesServiceSpy.create.and.returnValue(
      throwError(() => new Error('Error backend'))
    );

    component.laboratories = mockLaboratories;
    component.form.setValue({
      code: 'MUE-001',
      description: 'Muestra de sangre',
      laboratory: 1
    });

    component.onSubmit();

    expect(component.mensajeError)
      .toBe('No fue posible registrar el laboratorio. Verifique el código (No debe ser repetido)');
    expect(loadingServiceSpy.hide).toHaveBeenCalled();
  });
});