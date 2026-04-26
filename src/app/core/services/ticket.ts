import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TicketResponse } from '../models/ticket.models';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private readonly apiUrl = 'http://localhost:8081/api/tickets';

  constructor(private http: HttpClient) {}

  /**
   * Get a specific ticket by ID.
   * @param id - The ticket ID
   * @returns Observable of TicketResponse
   */
  getTicketById(id: number): Observable<TicketResponse> {
    return this.http.get<TicketResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get all tickets created by the currently authenticated employee.
   * @returns Observable of TicketResponse array
   */
  getMyTickets(): Observable<TicketResponse[]> {
    return this.http.get<TicketResponse[]>(`${this.apiUrl}/my-tickets`);
  }
}