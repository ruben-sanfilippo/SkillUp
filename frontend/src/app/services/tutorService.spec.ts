import { TestBed } from '@angular/core/testing';

import { TutorService } from './tutorService';

describe('TutorService', () => {
  let service: TutorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TutorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
