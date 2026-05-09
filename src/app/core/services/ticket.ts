import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TicketResponse, AssignTicketRequest, PaginatedResponse, TicketFilterParams, ConversationMessage, TicketStatusHistory } from '../models/ticket.models';



@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private readonly apiUrl = 'http://localhost:8081/api/tickets';

  constructor(private http: HttpClient) {}

  /**
   * Get a specific ticket by ID.
   */
  getTicketById(id: number): Observable<TicketResponse> {
    return this.http.get<TicketResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get all tickets created by the currently authenticated employee.
   */
  getMyTickets(): Observable<TicketResponse[]> {
    return this.http.get<TicketResponse[]>(`${this.apiUrl}/my-tickets`);
  }

  /**
   * Get tickets assigned to the current agent (paginated, filterable).
   * Requires ROLE_SUPPORT_AGENT or ROLE_SYSTEM_ADMIN.
   */
  getAssignedTickets(filters: TicketFilterParams = {}): Observable<PaginatedResponse<TicketResponse>> {
    let params = new HttpParams();

    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.fromDate) {
      params = params.set('fromDate', filters.fromDate);
    }
    if (filters.toDate) {
      params = params.set('toDate', filters.toDate);
    }
    if (filters.page !== undefined) {
      params = params.set('page', filters.page.toString());
    }
    if (filters.size !== undefined) {
      params = params.set('size', filters.size.toString());
    }

    return this.http.get<PaginatedResponse<TicketResponse>>(`${this.apiUrl}/assigned`, { params });
  }

  /**
   * Get all tickets in the system (paginated, filterable).
   * Requires ROLE_SYSTEM_ADMIN only.
   */
  getAllTickets(filters: TicketFilterParams = {}): Observable<PaginatedResponse<TicketResponse>> {
    let params = new HttpParams();

    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.fromDate) {
      params = params.set('fromDate', filters.fromDate);
    }
    if (filters.toDate) {
      params = params.set('toDate', filters.toDate);
    }
    if (filters.page !== undefined) {
      params = params.set('page', filters.page.toString());
    }
    if (filters.size !== undefined) {
      params = params.set('size', filters.size.toString());
    }

    return this.http.get<PaginatedResponse<TicketResponse>>(`${this.apiUrl}/all`, { params });
  }

  /**
   * Assign a ticket to a support agent.
   * Requires ROLE_SYSTEM_ADMIN only.
   */
  assignTicket(ticketId: number, agentEmail: string): Observable<TicketResponse> {
    const body: AssignTicketRequest = { agentEmail };
    return this.http.patch<TicketResponse>(`${this.apiUrl}/${ticketId}/assign`, body);
  }

    /**
   * Get the conversation history for a ticket.
   */
  getTicketResponses(ticketId: number): Observable<ConversationMessage[]> {
    return this.http.get<ConversationMessage[]>(`${this.apiUrl}/${ticketId}/responses`);
  }

  /**
   * Add a response to a ticket's conversation.
   */
  addResponse(ticketId: number, responseText: string): Observable<ConversationMessage> {
    return this.http.post<ConversationMessage>(`${this.apiUrl}/${ticketId}/responses`, { responseText });
  }

    /**
   * Update a ticket's status (close or reopen).
   */
  updateTicketStatus(ticketId: number, status: string, comment?: string): Observable<TicketResponse> {
    const body: { status: string; comment?: string } = { status };
    if (comment) {
      body.comment = comment;
    }
    return this.http.patch<TicketResponse>(`${this.apiUrl}/${ticketId}/status`, body);
  }

  /**
   * Get the status change history for a ticket.
   */
  getTicketHistory(ticketId: number): Observable<TicketStatusHistory[]> {
    return this.http.get<TicketStatusHistory[]>(`${this.apiUrl}/${ticketId}/history`);
  }
}