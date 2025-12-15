import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditLaboratoryComponent } from './edit-laboratory.component';
import { LaboratoriesService } from 'src/app/services/laboratories.service';
import { LoadingService } from 'src/app/services/loading.service';
import { AuthService } from 'src/app/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Laboratory } from 'src/app/models/laboratory';

describe('EditLaboratoryComponent', () => {
  let component: EditLaboratoryComponent;
  let fixture: ComponentFixture<EditLaboratoryComponent>;
  let laboratoriesServiceSpy: jasmine.SpyObj<LaboratoriesService>;
  let loadingServiceSpy: jasmine.SpyObj<LoadingService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockLaboratory: Laboratory = {
    id: 1,
    name: 'Laboratorio Central',
    description: 'Descripción laboratorio',
    state: 'ACTIVO'
  };

  beforeEach(async () => {
    laboratoriesServiceSpy = jasmine.createSpyObj('LaboratoriesService', [
      'getById',
      'update'
    ]);

    loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['show', 'hide']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAdmin']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [EditLaboratoryComponent],
      providers: [
        { provide: LaboratoriesService, useValue: laboratoriesServiceSpy },
        { provide: LoadingService, useValue: loadingServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1'
              }
            }
          }
        },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditLaboratoryComponent);
    component = fixture.componentInstance;
  });

  // ----------------------------------------
  // ngOnInit
  // ----------------------------------------

  it('debería cargar el laboratorio correctamente', () => {
    laboratoriesServiceSpy.getById.and.returnValue(of(mockLaboratory));

    component.ngOnInit();

    expect(component.laboratory).toEqual(mockLaboratory);
    expect(component.loading).toBeFalse();
    expect(component.form.value.name).toBe(mockLaboratory.name);
    expect(component.form.value.description).toBe(mockLaboratory.description);
  });

  it('debería mostrar error si el id es inválido', () => {
    (component as any).route.snapshot.paramMap.get = () => null;

    component.ngOnInit();

    expect(component.mensajeError).toBe('ID de laboratorio inválido');
    expect(component.loading).toBeFalse();
    expect(laboratoriesServiceSpy.getById).not.toHaveBeenCalled();
  });

  it('debería manejar error al obtener laboratorio', () => {
    laboratoriesServiceSpy.getById.and.returnValue(
      throwError(() => new Error('error'))
    );
    spyOn(console, 'error');

    component.ngOnInit();

    expect(component.mensajeError).toBe('No se pudo obtener el laboratorio');
    expect(component.loading).toBeFalse();
    expect(console.error).toHaveBeenCalled();
  });

  // ----------------------------------------
  // onSubmit
  // ----------------------------------------

  it('no debería enviar el formulario si es inválido', () => {
    component.form.setValue({
      name: '',
      description: ''
    });

    component.onSubmit();

    expect(component.mensajeError).toBe('Completa los campos requeridos');
    expect(loadingServiceSpy.hide).toHaveBeenCalled();
    expect(laboratoriesServiceSpy.update).not.toHaveBeenCalled();
  });

  it('debería actualizar el laboratorio y navegar como admin', () => {
    spyOn(window, 'alert');
    authServiceSpy.isAdmin.and.returnValue(true);
    laboratoriesServiceSpy.update.and.returnValue(of(mockLaboratory));

    component.laboratoryId = 1;
    component.laboratory = mockLaboratory;

    component.form.setValue({
      name: 'Nuevo nombre',
      description: 'Nueva descripción'
    });

    component.onSubmit();

    expect(laboratoriesServiceSpy.update).toHaveBeenCalledWith(1, {
      name: 'Nuevo nombre',
      description: 'Nueva descripción',
      state: 'ACTIVO'
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/laboratories']);
    expect(window.alert).toHaveBeenCalledWith('Laboratorio actualizado correctamente');
    expect(loadingServiceSpy.hide).toHaveBeenCalled();
  });

  it('debería actualizar el laboratorio y navegar como no admin', () => {
    authServiceSpy.isAdmin.and.returnValue(false);
    laboratoriesServiceSpy.update.and.returnValue(of(mockLaboratory));

    component.laboratoryId = 1;
    component.laboratory = mockLaboratory;

    component.form.setValue({
      name: 'Nuevo nombre',
      description: 'Nueva descripción'
    });

    component.onSubmit();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('debería manejar error al actualizar laboratorio', () => {
    spyOn(console, 'error');
    laboratoriesServiceSpy.update.and.returnValue(
      throwError(() => new Error('error'))
    );

    component.laboratoryId = 1;
    component.laboratory = mockLaboratory;

    component.form.setValue({
      name: 'Nuevo nombre',
      description: 'Nueva descripción'
    });

    component.onSubmit();

    expect(component.mensajeError).toBe('Error al actualizar laboratorio');
    expect(loadingServiceSpy.hide).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

it('debería enviar name = undefined cuando el valor del formulario es null', () => {
    laboratoriesServiceSpy.update.and.returnValue(of(mockLaboratory));

    component.laboratoryId = 1;
    component.laboratory = mockLaboratory;

    component.form.patchValue({
      name: null,
      description: 'Descripción válida'
    });

    spyOnProperty(component.form, 'invalid', 'get').and.returnValue(false);

    component.onSubmit();

    expect(laboratoriesServiceSpy.update).toHaveBeenCalledWith(1, {
      name: undefined,
      description: 'Descripción válida',
      state: 'ACTIVO'
    });

    expect(loadingServiceSpy.hide).toHaveBeenCalled();
  });

  it('debería enviar description = undefined cuando el valor del formulario es null', () => {
    laboratoriesServiceSpy.update.and.returnValue(of(mockLaboratory));

    component.laboratoryId = 1;
    component.laboratory = mockLaboratory;

    component.form.patchValue({
      name: 'Laboratorio válido',
      description: null
    });

    // forzamos formulario válido
    spyOnProperty(component.form, 'invalid', 'get').and.returnValue(false);

    component.onSubmit();

    expect(laboratoriesServiceSpy.update).toHaveBeenCalledWith(1, {
      name: 'Laboratorio válido',
      description: undefined,
      state: 'ACTIVO'
    });

    expect(loadingServiceSpy.hide).toHaveBeenCalled();
  });
});