import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditSampleComponent } from './edit-sample.component';
import { SamplesService } from 'src/app/services/samples.service';
import { LoadingService } from 'src/app/services/loading.service';
import { AuthService } from 'src/app/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Sample } from 'src/app/models/sample';

describe('EditSampleComponent', () => {
  let component: EditSampleComponent;
  let fixture: ComponentFixture<EditSampleComponent>;

  let samplesServiceSpy: jasmine.SpyObj<SamplesService>;
  let loadingServiceSpy: jasmine.SpyObj<LoadingService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteMock: any;

  const mockSample: Sample = {
    id: 1,
    code: 'MUE-001',
    description: 'Muestra de sangre',
    technician: 'Juan Pérez',
    laboratory: 'Lab Central'
  };

  beforeEach(async () => {
    samplesServiceSpy = jasmine.createSpyObj('SamplesService', ['getById', 'update']);
    loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['show', 'hide']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAdmin']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy().and.returnValue('1')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [EditSampleComponent],
      providers: [
        { provide: SamplesService, useValue: samplesServiceSpy },
        { provide: LoadingService, useValue: loadingServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditSampleComponent);
    component = fixture.componentInstance;
  });

  // ---------------------------------------------------
  // ngOnInit
  // ---------------------------------------------------

  it('ngOnInit debería mostrar error si el ID es inválido', () => {
    activatedRouteMock.snapshot.paramMap.get.and.returnValue(null);

    component.ngOnInit();

    expect(component.mensajeError).toBe('ID de muestra inválida');
    expect(component.loading).toBeFalse();
  });

  it('ngOnInit debería cargar la muestra correctamente', () => {
    samplesServiceSpy.getById.and.returnValue(of({
      id: 1,
      code: 'MUE-001',
      description: 'Descripción',
      technician: 'Juan Pérez',
      laboratory: 'Lab Central'
    }));

    component.ngOnInit();

    expect(samplesServiceSpy.getById).toHaveBeenCalledWith(1);
    expect(component.form.value.code).toBe('MUE-001');
    expect(component.form.value.description).toBe('Descripción');
    expect(component.loading).toBeFalse();
  });

  it('ngOnInit debería manejar error al obtener la muestra', () => {
    samplesServiceSpy.getById.and.returnValue(throwError(() => new Error()));

    component.ngOnInit();

    expect(component.mensajeError).toBe('No se pudo obtener la muestra');
    expect(component.loading).toBeFalse();
  });

  // ---------------------------------------------------
  // onSubmit - validaciones
  // ---------------------------------------------------

  it('onSubmit debería mostrar error si el formulario es inválido', () => {
    component.form.setValue({
      code: '',
      description: ''
    });

    component.onSubmit();

    expect(component.mensajeError).toBe('Completa los campos requeridos');
    expect(loadingServiceSpy.hide).toHaveBeenCalled();
    expect(samplesServiceSpy.update).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------
  // onSubmit - éxito
  // ---------------------------------------------------

  it('onSubmit debería actualizar la muestra y navegar como admin', () => {
    authServiceSpy.isAdmin.and.returnValue(true);
    samplesServiceSpy.update.and.returnValue(of(mockSample));

    component.sampleId = 1;
    component.form.setValue({
      code: 'MUE-002',
      description: 'Nueva descripción'
    });

    component.onSubmit();

    expect(samplesServiceSpy.update).toHaveBeenCalledWith(1, {
      code: 'MUE-002',
      description: 'Nueva descripción'
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/samples']);
    expect(loadingServiceSpy.hide).toHaveBeenCalled();
  });

  it('onSubmit debería actualizar la muestra y navegar como técnico', () => {
    authServiceSpy.isAdmin.and.returnValue(false);
    samplesServiceSpy.update.and.returnValue(of(mockSample));

    component.sampleId = 1;
    component.form.setValue({
      code: 'MUE-003',
      description: 'Otra descripción'
    });

    component.onSubmit();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    expect(loadingServiceSpy.hide).toHaveBeenCalled();
  });

  // ---------------------------------------------------
  // onSubmit - error
  // ---------------------------------------------------

  it('onSubmit debería manejar error al actualizar la muestra', () => {
    samplesServiceSpy.update.and.returnValue(throwError(() => new Error()));
    component.sampleId = 1;

    component.form.setValue({
      code: 'MUE-004',
      description: 'Error'
    });

    component.onSubmit();

    expect(component.mensajeError).toBe('Error al actualizar muestra');
    expect(loadingServiceSpy.hide).toHaveBeenCalled();
  });

  // ---------------------------------------------------
  // payload undefined
  // ---------------------------------------------------

  it('onSubmit debería enviar code = undefined cuando el valor del formulario es null', () => {
    // arrange
    samplesServiceSpy.update.and.returnValue(of(mockSample));

    component.sampleId = 1;

    // fuerza estado válido
    component.form.patchValue({
      code: null,
      description: 'Descripción válida'
    });

    // fuerza validación manual
    component.form.get('code')?.setErrors(null);

    // act
    component.onSubmit();

    // assert
    expect(samplesServiceSpy.update).toHaveBeenCalledWith(
      1,
      jasmine.objectContaining({
        code: undefined
      })
    );
  });

  it('onSubmit debería enviar description = undefined cuando el valor es null', () => {
    // arrange
    samplesServiceSpy.update.and.returnValue(of(mockSample));
    component.sampleId = 1;

    component.form.patchValue({
      code: 'COD-123',
      description: null
    });

    // 👇 forzamos el form a estado válido
    component.form.get('description')?.setErrors(null);

    // act
    component.onSubmit();

    // assert
    expect(samplesServiceSpy.update).toHaveBeenCalledWith(
      1,
      jasmine.objectContaining({
        description: undefined
      })
    );
  });
});