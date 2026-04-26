import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';
import { TicketService } from '../../../core/services/ticket';
import { TicketResponse } from '../../../core/models/ticket.models';

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './my-tickets.html',
  styleUrl: './my-tickets.css',
})
export class MyTicketsComponent implements OnInit {

  tickets: TicketResponse[] = [];
  isLoading = true;

  constructor(
    private ticketService: TicketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.ticketService.getMyTickets().subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  statusBadgeClass(status: string): string {
    switch (status) {
      case 'OPEN': return 'bg-red-100 text-red-700';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-700';
      case 'CLOSED': return 'bg-green-100 text-green-700';
      default: return '';
    }
  }
}