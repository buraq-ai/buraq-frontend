import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard';
import { SystemHealth, ServiceHealth } from '../../../core/models/dashboard';
import { interval, Subscription } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './health.html'
})
export class HealthComponent implements OnInit, OnDestroy {

  systemHealth: SystemHealth | null = null;
  loading = true;
  error: string | null = null;
  countdown = 30;

  private refreshSubscription: Subscription | null = null;
  private countdownInterval: any = null;

    constructor(
      private dashboardService: DashboardService,
      private cdr: ChangeDetectorRef
    ) {}

  ngOnInit(): void {
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    // Prevent memory leaks — stop all subscriptions and intervals
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private startAutoRefresh(): void {
    this.refreshSubscription = interval(30000)
      .pipe(
        startWith(0),  // fire immediately on load, then every 30s
        switchMap(() => this.dashboardService.getSystemHealth())
      )
      .subscribe({
        next: (data) => {
          this.systemHealth = data;
          this.loading = false;
          this.error = null;
          this.resetCountdown();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Failed to load system health. Please try again.';
          this.loading = false;
          console.error('Health check error:', err);
        }
      });
  }

  private resetCountdown(): void {
    this.countdown = 30;
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.countdown = 30;
      }
    }, 1000);
  }

  hasDownService(): boolean {
    return this.systemHealth?.services?.some(s => s.status === 'DOWN') ?? false;
  }

  getStatusClass(service: ServiceHealth): string {
    return service.status === 'UP' ? 'status-up' : 'status-down';
  }

  getStatusDot(service: ServiceHealth): string {
    return service.status === 'UP' ? '🟢' : '🔴';
  }

  formatResponseTime(service: ServiceHealth): string {
    if (service.status !== 'UP' || service.responseTimeMs === null) {
      return 'N/A';
    }
    return `${service.responseTimeMs}ms`;
  }
}