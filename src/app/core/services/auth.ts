import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private accessToken: string | null = null;
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly ROLE_KEY = 'userRole';  // ← new
  private readonly ACCESS_TOKEN_KEY = 'accessToken';

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/api/auth/login`, { email, password })
      .pipe(
        tap(response => {
          this.accessToken = response.accessToken;
          localStorage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken);
          localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
          localStorage.setItem(this.ROLE_KEY, response.role);  // ← save role
        })
      );
  }

  getAccessToken(): string | null {
    return this.accessToken ?? localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return this.accessToken ?? localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  // ← new method — returns the role stored after login
  getUserRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }

  logout(): void {
    this.accessToken = null;
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);  // ← clear role on logout
  }

  isLoggedIn(): boolean {
    return this.getAccessToken() !== null;
  }
}