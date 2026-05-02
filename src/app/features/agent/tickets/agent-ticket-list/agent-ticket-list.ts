import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TicketService } from '../../../../core/services/ticket';
import { TicketResponse, PaginatedResponse, TicketFilterParams } from '../../../../core/models/ticket.models';

@Component({
  selector: 'app-agent-ticket-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './agent-ticket-list.html',
  styleUrl: './agent-ticket-list.css'
})
export class AgentTicketListComponent implements OnInit {

  tickets: TicketResponse[] = [];
  totalElements = 0;
  totalPages = 0;
  currentPage = 0;
  pageSize = 10;

  // Filter state
  selectedStatus: string = '';
  fromDate: string = '';
  toDate: string = '';

  loading = false;

  constructor(
    private ticketService: TicketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  /**
   * Fetches tickets from the API using current filter and pagination state.
   */
  loadTickets(): void {
    this.loading = true;

    const filters: TicketFilterParams = {
      page: this.currentPage,
      size: this.pageSize
    };

    if (this.selectedStatus) {
      filters.status = this.selectedStatus as 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
    }
    if (this.fromDate) {
      filters.fromDate = this.fromDate;
    }
    if (this.toDate) {
      filters.toDate = this.toDate;
    }

    this.ticketService.getAssignedTickets(filters).subscribe({
      next: (response: PaginatedResponse<TicketResponse>) => {
        this.tickets = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.currentPage = response.currentPage;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load assigned tickets:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Called when any filter changes — reset to page 0 and reload.
   */
  onFilterChange(): void {
    this.currentPage = 0;
    this.loadTickets();
  }

  /**
   * Clears all filters and reloads.
   */
  clearFilters(): void {
    this.selectedStatus = '';
    this.fromDate = '';
    this.toDate = '';
    this.currentPage = 0;
    this.loadTickets();
  }

  /**
   * Navigate to the previous page if available.
   */
  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadTickets();
    }
  }

  /**
   * Navigate to the next page if available.
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadTickets();
    }
  }

  /**
   * Returns a Tailwind CSS class for the status badge color.
   */
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'OPEN':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'CLOSED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}