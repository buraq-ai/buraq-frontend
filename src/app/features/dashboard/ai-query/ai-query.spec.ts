import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiQuery } from './ai-query';

describe('AiQuery', () => {
  let component: AiQuery;
  let fixture: ComponentFixture<AiQuery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiQuery]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiQuery);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
