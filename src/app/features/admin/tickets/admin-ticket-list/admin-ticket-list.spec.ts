import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminTicketListComponent } from './admin-ticket-list';

describe('AdminTicketListComponent', () => {
  let component: AdminTicketListComponent;
  let fixture: ComponentFixture<AdminTicketListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTicketListComponent]
    })
    .compileComponents();
    fixture = TestBed.createComponent(AdminTicketListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
