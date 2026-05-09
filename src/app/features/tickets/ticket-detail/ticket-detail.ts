import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';
import { TicketService } from '../../../core/services/ticket';
import { AuthService } from '../../../core/services/auth';
import { TicketResponse, ConversationMessage } from '../../../core/models/ticket.models';
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
  isLoading = true;
  errorMessage: string | null = null;

  // Response input
  responseText = '';
  isSubmitting = false;
  submitError: string | null = null;

  // Current user
  currentUserEmail: string | null = null;
  currentUserRole: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Get current user info from JWT (email) and AuthService (role)
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
        // If 403, the user can't view the conversation — that's okay, just don't show it
        console.error('Failed to load responses:', err);
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
        // Append the new response to the local array
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

  /**
   * Determines if the response input should be visible.
   * Visible to: ticket owner, assigned agent, or ROLE_SYSTEM_ADMIN
   * Hidden when: ticket is CLOSED
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