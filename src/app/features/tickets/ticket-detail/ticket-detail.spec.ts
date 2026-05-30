import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TicketDetailComponent } from './ticket-detail';

describe('TicketDetailComponent', () => {
  let component: TicketDetailComponent;
  let fixture: ComponentFixture<TicketDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketDetailComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();
    fixture = TestBed.createComponent(TicketDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
