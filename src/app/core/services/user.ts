import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:8081/api/admin';

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

  getAllUsers(): Observable<UserResponse[]> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<UserResponse[]>(`${this.apiUrl}/users`, { headers });
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