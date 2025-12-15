import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateLaboratoryComponent } from './create-laboratory.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LaboratoriesService } from 'src/app/services/laboratories.service';
import { LoadingService } from 'src/app/services/loading.service';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Laboratory } from 'src/app/models/laboratory';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('CreateLaboratoryComponent', () => {
  let component: CreateLaboratoryComponent;
  let fixture: ComponentFixture<CreateLaboratoryComponent>;

  let laboratoriesServiceSpy: jasmine.SpyObj<LaboratoriesService>;
  let loadingServiceSpy: jasmine.SpyObj<LoadingService>;

  beforeEach(async () => {
    laboratoriesServiceSpy = jasmine.createSpyObj('LaboratoriesService', ['create']);
    loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['show', 'hide']);

    await TestBed.configureTestingModule({
      imports: [
        CreateLaboratoryComponent,
        ReactiveFormsModule,
        CommonModule,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: LaboratoriesService, useValue: laboratoriesServiceSpy },
        { provide: LoadingService, useValue: loadingServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateLaboratoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // -------------------------------------------------------
  // Creación
  // -------------------------------------------------------
  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  // -------------------------------------------------------
  // Formulario inválido
  // -------------------------------------------------------
  it('debería mostrar error y no llamar al servicio si el formulario es inválido', () => {
    component.form.patchValue({
      name: '',
      description: ''
    });

    component.onSubmit();

    expect(component.mensajeError).toBe('Completa los campos requeridos');
    expect(laboratoriesServiceSpy.create).not.toHaveBeenCalled();
    expect(loadingServiceSpy.hide).toHaveBeenCalled();
  });

  // -------------------------------------------------------
  // name o description undefined
  // -------------------------------------------------------
  // it('debería mostrar error si name o description vienen undefined', () => {
  //   component.form.patchValue({
  //     name: 'Laboratorio',
  //     description: undefined
  //   });

  //   // forzamos formulario válido para entrar al branch
  //   spyOnProperty(component.form, 'invalid', 'get').and.returnValue(false);

  //   component.onSubmit();

  //   expect(component.mensajeError).toBe('Nombre y descripción son obligatorios');
  //   expect(laboratoriesServiceSpy.create).not.toHaveBeenCalled();
  //   expect(loadingServiceSpy.hide).toHaveBeenCalled();
  // });

  // -------------------------------------------------------
  // Creación exitosa
  // -------------------------------------------------------
  it('debería crear el laboratorio correctamente cuando el formulario es válido', () => {
    const mockLaboratory: Laboratory = {
      id: 1,
      name: 'Laboratorio Central',
      description: 'Descripción',
      state: 'ACTIVO'
    };

    laboratoriesServiceSpy.create.and.returnValue(of(mockLaboratory));

    component.form.patchValue({
      name: 'Laboratorio Central',
      description: 'Descripción'
    });

    component.onSubmit();

    expect(laboratoriesServiceSpy.create).toHaveBeenCalledWith({
      name: 'Laboratorio Central',
      description: 'Descripción',
      state: 'ACTIVO'
    });

    expect(component.mensajeOk)
      .toBe('Se ha registrado el laboratorio Laboratorio Central exitosamente');

    expect(component.cargando).toBeFalse();
    expect(loadingServiceSpy.hide).toHaveBeenCalled();
  });

  // -------------------------------------------------------
  // Error del backend
  // -------------------------------------------------------
  it('debería mostrar mensaje de error si falla la creación del laboratorio', () => {
    laboratoriesServiceSpy.create.and.returnValue(
      throwError(() => ({ status: 500 }))
    );

    component.form.patchValue({
      name: 'Laboratorio Error',
      description: 'Descripción'
    });

    component.onSubmit();

    expect(component.mensajeError)
      .toBe('No fue posible registrar el laboratorio. Verifique el nombre (No puede ser repetido)');

    expect(component.cargando).toBeFalse();
    expect(loadingServiceSpy.hide).toHaveBeenCalled();
  });
});