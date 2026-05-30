import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgentTicketListComponent } from './agent-ticket-list';

describe('AgentTicketListComponent', () => {
  let component: AgentTicketListComponent;
  let fixture: ComponentFixture<AgentTicketListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentTicketListComponent]
    })
    .compileComponents();
    fixture = TestBed.createComponent(AgentTicketListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
