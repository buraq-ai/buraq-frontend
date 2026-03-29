import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
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
  private readonly ROLE_KEY = 'userRole';
  private readonly ACCESS_TOKEN_KEY = 'accessToken';

  constructor(private http: HttpClient, private router: Router) { }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/api/auth/login`, { email, password })
      .pipe(
        tap(response => {
          this.accessToken = response.accessToken;
          localStorage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken);
          localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
          localStorage.setItem(this.ROLE_KEY, response.role);
        })
      );
  }

  getAccessToken(): string | null {
    return this.accessToken ?? localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY); // ← bug fix
  }

  getUserRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();

    if (refreshToken) {
      this.http.post(`${environment.apiUrl}/api/auth/logout`, { refreshToken }).subscribe({
        complete: () => this.clearSessionAndRedirect(),
        error: () => this.clearSessionAndRedirect()
      });
    } else {
      this.clearSessionAndRedirect();
    }
  }

  private clearSessionAndRedirect(): void {
    this.accessToken = null;
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.getAccessToken() !== null;
  }
}