import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TicketStats, AgentStats, AIStats, SystemHealth } from '../models/dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly apiUrl = '/api/dashboard';

  constructor(private http: HttpClient) {}

  getTicketStats(fromDate?: string, toDate?: string): Observable<TicketStats> {
    let params = new HttpParams();

    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }
    if (toDate) {
      params = params.set('toDate', toDate);
    }

    return this.http.get<TicketStats>(`${this.apiUrl}/ticket-stats`, { params });
  }

  getAgentStats(): Observable<AgentStats[]> {
    return this.http.get<AgentStats[]>(`${this.apiUrl}/ticket-stats/by-agent`);
  }

  getAIStats(): Observable<AIStats> {
    return this.http.get<AIStats>(`${this.apiUrl}/ai-stats`);
  }

  getSystemHealth(): Observable<SystemHealth> {
    return this.http.get<SystemHealth>(`${this.apiUrl}/system-health`);
  }
}