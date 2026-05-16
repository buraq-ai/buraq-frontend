import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { DashboardService } from '../../../core/services/dashboard';
import { TicketStats, AgentStats } from '../../../core/models/dashboard';

@Component({
  selector: 'app-ticket-stats',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './ticket-stats.html',
  styleUrl: './ticket-stats.css'
})
export class TicketStatsComponent implements OnInit {

  ticketStats: TicketStats | null = null;
  agentStats: AgentStats[] = [];

  fromDate: string = '';
  toDate: string = '';

  loading = false;
  error: string | null = null;

  // Chart configurations
  lineChartData: ChartData<'line'> = { labels: [], datasets: [] };
  lineChartOptions: ChartOptions<'line'> = {};

  barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  barChartOptions: ChartOptions<'bar'> = {};

  constructor(
      private dashboardService: DashboardService,
      private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initChartOptions();
    this.loadAllStats();
  }

  loadAllStats(): void {
    this.loading = true;
    this.error = null;

    this.dashboardService.getTicketStats(
      this.fromDate || undefined,
      this.toDate || undefined
    ).subscribe({
      next: (stats) => {
        this.ticketStats = stats;
        this.buildLineChart(stats);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load ticket statistics.';
        console.error('Error loading ticket stats:', err);
        this.loading = false;
        
      }
    });

    this.dashboardService.getAgentStats().subscribe({
      next: (stats) => {
        this.agentStats = stats;
        this.buildBarChart(stats);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading agent stats:', err);
      }
    });
  }

  applyDateFilter(): void {
    this.loadAllStats();
  }

  resetDateFilter(): void {
    this.fromDate = '';
    this.toDate = '';
    this.loadAllStats();
  }

  private initChartOptions(): void {
    const textColor = '#9ca3af'; // gray-400
    const gridColor = 'rgba(255, 255, 255, 0.05)';

    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { color: textColor, maxTicksLimit: 10 },
          grid: { color: gridColor }
        },
        y: {
          min: 0,
          ticks: { color: textColor, precision: 0 },
          grid: { color: gridColor }
        }
      }
    };

    this.barChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor }
        }
      },
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        y: {
          min: 0,
          ticks: { color: textColor, precision: 0 },
          grid: { color: gridColor }
        }
      }
    };
  }

  private buildLineChart(stats: TicketStats): void {
    const labels = stats.ticketsPerDay.map(d => d.date);
    const data = stats.ticketsPerDay.map(d => d.count);

    this.lineChartData = {
      labels,
      datasets: [
        {
          data,
          label: 'Tickets Created',
          borderColor: '#3b82f6',       // blue-500
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,                  // smooth line
          pointRadius: 2,
          pointHoverRadius: 5,
          pointBackgroundColor: '#3b82f6'
        }
      ]
    };
  }

  private buildBarChart(agents: AgentStats[]): void {
    const labels = agents.map(a => a.agentEmail);
    const assignedData = agents.map(a => a.totalAssigned);
    const closedData = agents.map(a => a.totalClosed);

    this.barChartData = {
      labels,
      datasets: [
        {
          data: assignedData,
          label: 'Assigned',
          backgroundColor: '#3b82f6',    // blue-500
          borderRadius: 4
        },
        {
          data: closedData,
          label: 'Closed',
          backgroundColor: '#22c55e',    // green-500
          borderRadius: 4
        }
      ]
    };
  }
}