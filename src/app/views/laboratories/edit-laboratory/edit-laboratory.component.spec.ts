import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLaboratoryComponent } from './edit-laboratory.component';

describe('EditLaboratoryComponent', () => {
  let component: EditLaboratoryComponent;
  let fixture: ComponentFixture<EditLaboratoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EditLaboratoryComponent]
    });
    fixture = TestBed.createComponent(EditLaboratoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
