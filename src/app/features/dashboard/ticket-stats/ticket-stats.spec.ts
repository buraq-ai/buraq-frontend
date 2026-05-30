import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketStatsComponent } from './ticket-stats';

describe('TicketStatsComponent', () => {
  let component: TicketStatsComponent;
  let fixture: ComponentFixture<TicketStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketStatsComponent]
    })
    .compileComponents();
    fixture = TestBed.createComponent(TicketStatsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
