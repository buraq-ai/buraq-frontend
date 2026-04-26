import { TestBed } from '@angular/core/testing';

import { AiQuery } from './ai-query';

describe('AiQuery', () => {
  let service: AiQuery;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiQuery);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
