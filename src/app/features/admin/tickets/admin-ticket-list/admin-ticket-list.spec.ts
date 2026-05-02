import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTicketList } from './admin-ticket-list';

describe('AdminTicketList', () => {
  let component: AdminTicketList;
  let fixture: ComponentFixture<AdminTicketList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTicketList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminTicketList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
