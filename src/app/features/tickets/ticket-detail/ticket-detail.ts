import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';
import { TicketService } from '../../../core/services/ticket';
import { TicketResponse } from '../../../core/models/ticket.models';


@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.css',
})
export class TicketDetailComponent implements OnInit {

  ticket: TicketResponse | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.errorMessage = 'No ticket ID provided.';
      this.isLoading = false;
      return;
    }

    const ticketId = Number(idParam);

    this.ticketService.getTicketById(ticketId).subscribe({
      next: (ticket) => {
        this.ticket = ticket;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 404) {
          this.errorMessage = 'Ticket not found.';
        } else if (err.status === 403) {
          this.errorMessage = 'You do not have permission to view this ticket.';
        } else {
          this.errorMessage = 'An error occurred while loading the ticket.';
        }
        this.isLoading = false;
      }
    });
  }

  get statusBadgeClass(): string {
    if (!this.ticket) return '';
    switch (this.ticket.status) {
      case 'OPEN': return 'bg-red-100 text-red-700';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-700';
      case 'CLOSED': return 'bg-green-100 text-green-700';
      default: return '';
    }
  }
}