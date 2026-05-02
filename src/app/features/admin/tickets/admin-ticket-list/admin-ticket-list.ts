import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TicketService } from '../../../../core/services/ticket';
import { TicketResponse, PaginatedResponse, TicketFilterParams } from '../../../../core/models/ticket.models';

@Component({
  selector: 'app-admin-ticket-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-ticket-list.html',
  styleUrl: './admin-ticket-list.css'
})
export class AdminTicketListComponent implements OnInit {

  tickets: TicketResponse[] = [];
  totalElements = 0;
  totalPages = 0;
  currentPage = 0;
  pageSize = 10;

  // Filter state
  selectedStatus: string = '';
  fromDate: string = '';
  toDate: string = '';

  // Assign modal state
  showAssignModal = false;
  selectedTicketId: number | null = null;
  agentEmail: string = '';
  assignError: string = '';
  assigning = false;

  loading = false;

  constructor(
    private ticketService: TicketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  /**
   * Fetches ALL tickets (admin view) using current filter and pagination.
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

    this.ticketService.getAllTickets(filters).subscribe({
      next: (response: PaginatedResponse<TicketResponse>) => {
        this.tickets = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.currentPage = response.currentPage;
        this.loading = false;
        this.cdr.detectChanges();
        
      },
      error: (err) => {
        console.error('Failed to load tickets:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadTickets();
  }

  clearFilters(): void {
    this.selectedStatus = '';
    this.fromDate = '';
    this.toDate = '';
    this.currentPage = 0;
    this.loadTickets();
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadTickets();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadTickets();
    }
  }

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

  /**
   * Opens the assign modal for a specific unassigned ticket.
   */
  openAssignModal(ticketId: number): void {
    this.selectedTicketId = ticketId;
    this.agentEmail = '';
    this.assignError = '';
    this.showAssignModal = true;
  }

  /**
   * Closes the assign modal and resets state.
   */
  closeAssignModal(): void {
    this.showAssignModal = false;
    this.selectedTicketId = null;
    this.agentEmail = '';
    this.assignError = '';
  }

  /**
   * Calls the API to assign the ticket to the specified agent email.
   */
  confirmAssign(): void {
    if (!this.selectedTicketId || !this.agentEmail.trim()) {
      this.assignError = 'Please enter an agent email.';
      return;
    }

    this.assigning = true;
    this.assignError = '';

    this.ticketService.assignTicket(this.selectedTicketId, this.agentEmail.trim()).subscribe({
      next: () => {
        this.assigning = false;
        this.closeAssignModal();
        this.loadTickets(); // Refresh the list
      },
      error: (err) => {
        this.assigning = false;
        this.assignError = err.error?.message || 'Assignment failed. Please check the email and try again.';
        this.cdr.detectChanges();
      }
    });
  }
}