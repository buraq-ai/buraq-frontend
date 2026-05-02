import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentTicketList } from './agent-ticket-list';

describe('AgentTicketList', () => {
  let component: AgentTicketList;
  let fixture: ComponentFixture<AgentTicketList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentTicketList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentTicketList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
