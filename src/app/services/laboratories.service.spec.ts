import { TestBed } from '@angular/core/testing';

import { LaboratoriosService } from './laboratories.service';

describe('LaboratoriosService', () => {
  let service: LaboratoriosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LaboratoriosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
