import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HealthComponent } from './health';

describe('HealthComponent', () => {
  let component: HealthComponent;
  let fixture: ComponentFixture<HealthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthComponent]
    })
    .compileComponents();
    fixture = TestBed.createComponent(HealthComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
