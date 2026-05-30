import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  role: string;
}

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

// Paginated response from backend
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

// Filters object for searchUsers
export interface UserSearchFilters {
  search?: string;
  role?: string;
  active?: boolean;
  page?: number;
  size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = '/api/admin';

  constructor(private http: HttpClient) {}

  createUser(userData: CreateUserRequest): Observable<UserResponse> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<UserResponse>(`${this.apiUrl}/users`, userData, { headers });
  }

  getUserById(id: number): Observable<UserResponse> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<UserResponse>(`${this.apiUrl}/users/${id}`, { headers });
  }

  updateUser(id: number, userData: any): Observable<UserResponse> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<UserResponse>(`${this.apiUrl}/users/${id}`, userData, { headers });
  }

  searchUsers(filters: UserSearchFilters = {}): Observable<PaginatedResponse<UserResponse>> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    // Build query parameters dynamically from non-empty filters
    let params = new HttpParams();
    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.role) {
      params = params.set('role', filters.role);
    }
    if (filters.active !== undefined && filters.active !== null) {
      params = params.set('active', filters.active.toString());
    }
    if (filters.page !== undefined && filters.page !== null) {
      params = params.set('page', filters.page.toString());
    }
    if (filters.size !== undefined && filters.size !== null) {
      params = params.set('size', filters.size.toString());
    }

    return this.http.get<PaginatedResponse<UserResponse>>(`${this.apiUrl}/users`, {
      headers,
      params
    });
  }

  deactivateUser(id: number): Observable<UserResponse> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.patch<UserResponse>(`${this.apiUrl}/users/${id}/deactivate`, {}, { headers });
  }
}