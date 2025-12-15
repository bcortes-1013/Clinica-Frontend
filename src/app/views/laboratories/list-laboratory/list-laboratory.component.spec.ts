import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListLaboratoryComponent } from './list-laboratory.component';
import { LaboratoriesService } from 'src/app/services/laboratories.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Laboratory } from 'src/app/models/laboratory';

describe('ListLaboratoryComponent', () => {
  let component: ListLaboratoryComponent;
  let fixture: ComponentFixture<ListLaboratoryComponent>;
  let laboratoriesServiceSpy: jasmine.SpyObj<LaboratoriesService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockLabs: Laboratory[] = [
    { id: 1, name: 'Lab 1', description: 'Desc 1', state: 'ACTIVO' },
    { id: 2, name: 'Lab 2', description: 'Desc 2', state: 'INACTIVO' }
  ];

  beforeEach(async () => {
    laboratoriesServiceSpy = jasmine.createSpyObj('LaboratoriesService', [
      'getAll',
      'delete'
    ]);

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ListLaboratoryComponent],
      providers: [
        { provide: LaboratoriesService, useValue: laboratoriesServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListLaboratoryComponent);
    component = fixture.componentInstance;
  });

  // ----------------------------------------
  // ngOnInit
  // ----------------------------------------

  it('debería cargar los laboratorios correctamente', () => {
    laboratoriesServiceSpy.getAll.and.returnValue(of(mockLabs));

    component.ngOnInit();

    expect(component.laboratories.length).toBe(2);
    expect(component.loading).toBeFalse();
    expect(component.error).toBe('');
  });

  it('debería manejar error al cargar los laboratorios', () => {
    laboratoriesServiceSpy.getAll.and.returnValue(throwError(() => new Error('error')));

    component.ngOnInit();

    expect(component.laboratories.length).toBe(0);
    expect(component.loading).toBeFalse();
    expect(component.error).toBe('No se pudieron cargar los laboratorios');
  });

  // ----------------------------------------
  // deleteLaboratory
  // ----------------------------------------

  it('no debería eliminar si el id es undefined', () => {
    component.deleteLaboratory(undefined);

    expect(laboratoriesServiceSpy.delete).not.toHaveBeenCalled();
  });

  it('no debería eliminar si el usuario cancela la confirmación', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteLaboratory(1);

    expect(laboratoriesServiceSpy.delete).not.toHaveBeenCalled();
  });

  it('debería eliminar el laboratorio y actualizar la lista', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');

    component.laboratories = [...mockLabs];
    laboratoriesServiceSpy.delete.and.returnValue(of(undefined));

    component.deleteLaboratory(1);

    expect(laboratoriesServiceSpy.delete).toHaveBeenCalledWith(1);
    expect(component.laboratories.length).toBe(1);
    expect(component.laboratories[0].id).toBe(2);
    expect(window.alert).toHaveBeenCalledWith('✅ Laboratorio eliminado correctamente');
  });

  it('debería mostrar alerta si ocurre error al eliminar', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');

    laboratoriesServiceSpy.delete.and.returnValue(
      throwError(() => new Error('error'))
    );

    component.deleteLaboratory(1);

    expect(window.alert).toHaveBeenCalledWith('No se pudo eliminar el laboratorio');
  });

  // ----------------------------------------
  // editLaboratory
  // ----------------------------------------

  it('debería navegar a editar laboratorio cuando hay id', () => {
    component.editLaboratory(5);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/laboratories/edit', 5]);
  });

  it('no debería navegar y mostrar warning si el id es undefined', () => {
    spyOn(console, 'warn');

    component.editLaboratory(undefined);

    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith('No hay ID para navegar');
  });

  // ----------------------------------------
  // createLaboratory
  // ----------------------------------------

  it('debería navegar a crear laboratorio', () => {
    component.createLaboratory();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/laboratories/create']);
  });
});