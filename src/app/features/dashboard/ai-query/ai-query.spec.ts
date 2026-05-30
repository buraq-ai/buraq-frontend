import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AiQueryComponent } from './ai-query';

describe('AiQueryComponent', () => {
  let component: AiQueryComponent;
  let fixture: ComponentFixture<AiQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiQueryComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();
    fixture = TestBed.createComponent(AiQueryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
