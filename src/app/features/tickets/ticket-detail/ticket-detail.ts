import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';
import { TicketService } from '../../../core/services/ticket';
import { AuthService } from '../../../core/services/auth';
import { TicketResponse, ConversationMessage, TicketStatusHistory } from '../../../core/models/ticket.models';
import { getUserEmailFromToken, getUserRoleFromToken } from '../../../core/utils/jwt-decoder';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FormsModule],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.css',
})
export class TicketDetailComponent implements OnInit {

  ticket: TicketResponse | null = null;
  responses: ConversationMessage[] = [];
  statusHistory: TicketStatusHistory[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  // Response input
  responseText = '';
  isSubmitting = false;
  submitError: string | null = null;

  // Current user
  currentUserEmail: string | null = null;
  currentUserRole: string | null = null;

  // Modal state
  showCloseModal = false;
  showReopenModal = false;
  modalComment = '';
  isModalSubmitting = false;
  modalError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Get current user info from JWT
    const token = this.authService.getAccessToken();
    if (token) {
      this.currentUserEmail = getUserEmailFromToken(token);
    }
    this.currentUserRole = this.authService.getUserRole();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.errorMessage = 'No ticket ID provided.';
      this.isLoading = false;
      return;
    }

    const ticketId = Number(idParam);

    // Load ticket details
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

    // Load conversation history
    this.loadResponses(ticketId);

    // Load status history
    this.loadHistory(ticketId);
  }

  /**
   * Loads the conversation history for the ticket.
   */
  loadResponses(ticketId: number): void {
    this.ticketService.getTicketResponses(ticketId).subscribe({
      next: (responses) => {
        this.responses = responses;
        this.cdr.detectChanges();
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('Failed to load responses:', err);
      }
    });
  }

  /**
   * Loads the status change history for the ticket.
   */
  loadHistory(ticketId: number): void {
    this.ticketService.getTicketHistory(ticketId).subscribe({
      next: (history) => {
        this.statusHistory = history;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load status history:', err);
        // Not critical — don't block the page
      }
    });
  }

  /**
   * Submits a new response to the conversation.
   */
  submitResponse(): void {
    if (!this.responseText.trim() || !this.ticket || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;

    this.ticketService.addResponse(this.ticket.id, this.responseText).subscribe({
      next: (newResponse) => {
        this.responses = [...this.responses, newResponse];
        this.responseText = '';
        this.isSubmitting = false;
        this.cdr.detectChanges();
        this.scrollToBottom();
      },
      error: (err) => {
        this.isSubmitting = false;
        if (err.status === 403) {
          this.submitError = 'You are not authorized to respond to this ticket.';
        } else if (err.status === 400) {
          this.submitError = err.error?.message || 'Cannot add response to this ticket.';
        } else {
          this.submitError = 'Failed to send response. Please try again.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  // ==================== STATUS CHANGE METHODS ====================

  /**
   * Opens the Close Ticket modal.
   */
  openCloseModal(): void {
    this.showCloseModal = true;
    this.modalComment = '';
    this.modalError = null;
    this.isModalSubmitting = false;
  }

  /**
   * Opens the Reopen Ticket modal.
   */
  openReopenModal(): void {
    this.showReopenModal = true;
    this.modalComment = '';
    this.modalError = null;
    this.isModalSubmitting = false;
  }

  /**
   * Closes any open modal.
   */
  closeModal(): void {
    this.showCloseModal = false;
    this.showReopenModal = false;
    this.modalComment = '';
    this.modalError = null;
    this.isModalSubmitting = false;
  }

  /**
   * Closes the ticket (IN_PROGRESS → CLOSED).
   */
  closeTicket(): void {
    if (!this.ticket || this.isModalSubmitting) return;

    this.isModalSubmitting = true;
    this.modalError = null;

    const comment = this.modalComment.trim() || undefined;

    this.ticketService.updateTicketStatus(this.ticket.id, 'CLOSED', comment).subscribe({
      next: (updatedTicket) => {
        this.ticket = updatedTicket;
        this.showCloseModal = false;
        this.isModalSubmitting = false;
        this.modalComment = '';

        // Reload history to get the new entry
        this.loadHistory(updatedTicket.id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isModalSubmitting = false;
        this.modalError = err.error?.message || 'Failed to close ticket.';
      }
    });
  }

  /**
   * Reopens the ticket (CLOSED → OPEN).
   */
  reopenTicket(): void {
    if (!this.ticket || this.isModalSubmitting) return;

    this.isModalSubmitting = true;
    this.modalError = null;

    const comment = this.modalComment.trim() || undefined;

    this.ticketService.updateTicketStatus(this.ticket.id, 'OPEN', comment).subscribe({
      next: (updatedTicket) => {
        this.ticket = updatedTicket;
        this.showReopenModal = false;
        this.isModalSubmitting = false;
        this.modalComment = '';

        // Reload history to get the new entry
        this.loadHistory(updatedTicket.id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isModalSubmitting = false;
        this.modalError = err.error?.message || 'Failed to reopen ticket.';
      }
    });
  }

    /**
   * Re-assigns an OPEN ticket to move it back to IN_PROGRESS.
   * Uses the currently assigned agent's email.
   */
  reassignTicket(): void {
    if (!this.ticket || !this.ticket.assigned_to || this.isSubmitting) return;

    this.isSubmitting = true;

    this.ticketService.assignTicket(this.ticket.id, this.ticket.assigned_to).subscribe({
      next: (updatedTicket) => {
        this.ticket = updatedTicket;
        this.isSubmitting = false;

        // Reload history to get the new entry
        this.loadHistory(updatedTicket.id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Failed to reassign ticket:', err);
      }
    });
  }

  // ==================== VISIBILITY HELPERS ====================

  /**
   * Determines if the response input should be visible.
   */
  get canRespond(): boolean {
    if (!this.ticket || !this.currentUserEmail || !this.currentUserRole) {
      return false;
    }
    if (this.ticket.status === 'CLOSED') {
      return false;
    }
    const isOwner = this.currentUserEmail === this.ticket.created_by;
    const isAssignedAgent = this.currentUserEmail === this.ticket.assigned_to;
    const isSystemAdmin = this.currentUserRole === 'ROLE_SYSTEM_ADMIN';

    return isOwner || isAssignedAgent || isSystemAdmin;
  }

  /**
   * Can the current user close this ticket?
   * Only the assigned agent or system admin, when status is IN_PROGRESS.
   */
  get canClose(): boolean {
    if (!this.ticket || !this.currentUserEmail || !this.currentUserRole) {
      return false;
    }
    if (this.ticket.status !== 'IN_PROGRESS') {
      return false;
    }
    const isAssignedAgent = this.currentUserEmail === this.ticket.assigned_to;
    const isSystemAdmin = this.currentUserRole === 'ROLE_SYSTEM_ADMIN';
    return isAssignedAgent || isSystemAdmin;
  }

  /**
   * Can the current user reopen this ticket?
   * Only system admin, when status is CLOSED.
   */
  get canReopen(): boolean {
    if (!this.ticket || !this.currentUserRole) {
      return false;
    }
    if (this.ticket.status !== 'CLOSED') {
      return false;
    }
    return this.currentUserRole === 'ROLE_SYSTEM_ADMIN';
  }

    /**
   * Can the current user re-assign this ticket (OPEN → IN_PROGRESS)?
   * Only system admin, when status is OPEN and ticket has an assignee.
   */
  get canReassign(): boolean {
    if (!this.ticket || !this.currentUserRole) {
      return false;
    }
    if (this.ticket.status !== 'OPEN') {
      return false;
    }
    if (!this.ticket.assigned_to) {
      return false;
    }
    return this.currentUserRole === 'ROLE_SYSTEM_ADMIN';
  }

  /**
   * Determines if a message is from the current user (for alignment).
   */
  isMyMessage(message: ConversationMessage): boolean {
    return message.respondedBy === this.currentUserEmail;
  }

  /**
   * Returns the character count remaining (max 2000).
   */
  get remainingChars(): number {
    return 2000 - (this.responseText?.length || 0);
  }

  /**
   * Returns the CSS class for the status badge.
   */
  get statusBadgeClass(): string {
    if (!this.ticket) return '';
    switch (this.ticket.status) {
      case 'OPEN': return 'bg-red-100 text-red-700';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-700';
      case 'CLOSED': return 'bg-green-100 text-green-700';
      default: return '';
    }
  }

  /**
   * Returns a human-readable label for a status change history entry.
   */
  getStatusChangeLabel(entry: TicketStatusHistory): string {
    if (entry.previous_status === 'OPEN' && entry.new_status === 'IN_PROGRESS') {
      return 'Assigned → In Progress';
    }
    if (entry.previous_status === 'IN_PROGRESS' && entry.new_status === 'CLOSED') {
      return 'Resolved → Closed';
    }
    if (entry.previous_status === 'CLOSED' && entry.new_status === 'OPEN') {
      return 'Reopened';
    }
    return `Status changed from ${entry.previous_status} to ${entry.new_status}`;
  }

  /**
   * Returns the dot color class for a status history entry.
   */
  getHistoryDotClass(entry: TicketStatusHistory): string {
    switch (entry.new_status) {
      case 'OPEN': return 'bg-red-500';
      case 'IN_PROGRESS': return 'bg-yellow-500';
      case 'CLOSED': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  }

  /**
   * Scrolls the conversation container to the bottom.
   */
  private scrollToBottom(): void {
    setTimeout(() => {
      const container = document.getElementById('conversation-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }
}