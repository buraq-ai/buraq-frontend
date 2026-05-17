import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiMetrics } from './ai-metrics';

describe('AiMetrics', () => {
  let component: AiMetrics;
  let fixture: ComponentFixture<AiMetrics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiMetrics]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiMetrics);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
