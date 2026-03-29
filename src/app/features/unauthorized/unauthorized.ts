import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  template: `
    <div class="unauthorized-container">
      <h1>⛔ Access Denied</h1>
      <p>You do not have permission to access this page.</p>
      <button (click)="goBack()">Go to Dashboard</button>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: Arial, sans-serif;
    }
    h1 { color: #e74c3c; }
    button {
      margin-top: 20px;
      padding: 10px 20px;
      cursor: pointer;
    }
  `]
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}