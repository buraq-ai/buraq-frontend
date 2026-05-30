import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AiMetricsComponent } from './ai-metrics';

describe('AiMetricsComponent', () => {
  let component: AiMetricsComponent;
  let fixture: ComponentFixture<AiMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiMetricsComponent]
    })
    .compileComponents();
    fixture = TestBed.createComponent(AiMetricsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
