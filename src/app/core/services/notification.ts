import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface NotificationDTO {
  id: number;
  recipientEmail: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  ticketId: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly baseUrl = `${environment.apiUrl}/api/notifications`;

  // Shared unread count — any component can subscribe to get real-time updates
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    // Fetch initial count on service creation
    this.refreshUnreadCount();
  }

  /**
   * Forces a refresh of the unread count from the server.
   * Call this after any action that might change the count (e.g., ticket creation).
   */
  refreshUnreadCount(): void {
    this.http.get<number>(`${this.baseUrl}/unread-count`).subscribe({
      next: (count) => this.unreadCountSubject.next(count),
      error: (err) => console.error('Failed to fetch unread count', err)
    });
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$;
  }

  getNotifications(): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>(this.baseUrl);
  }

  markAsRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<number> {
    return this.http.patch<number>(`${this.baseUrl}/read-all`, {});
  }
}