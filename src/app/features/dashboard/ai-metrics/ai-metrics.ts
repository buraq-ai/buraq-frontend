import { Component, inject, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DashboardService } from '../../../core/services/dashboard';
import { AIStats, DailyQueryCount } from '../../../core/models/dashboard';

@Component({
  selector: 'app-ai-metrics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './ai-metrics.html',
  styleUrls: []
})
export class AiMetricsComponent implements OnInit {

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  private readonly dashboardService = inject(DashboardService);
  private readonly cdr = inject(ChangeDetectorRef);

  // Summary card values
  totalQueries = 0;
  answerRate = 0;
  averageResponseTimeMs = 0;
  estimatedOpenAICost = 0;

  // Cost warning threshold
  showCostWarning = false;

  // Loading state
  isLoading = true;

  // --- Line chart: Queries Per Day ---
  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Queries',
        fill: true,
        tension: 0.3,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointRadius: 3,
        pointHoverRadius: 5
      }
    ]
  };

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  // --- Pie chart: Provider Breakdown ---
  providerPieData: ChartData<'pie'> = {
    labels: [],
    datasets: [{ data: [] }]
  };

  providerPieOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 16 }
      }
    }
  };

  // --- Pie chart: Language Breakdown ---
  languagePieData: ChartData<'pie'> = {
    labels: [],
    datasets: [{ data: [] }]
  };

  languagePieOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 16 }
      }
    }
  };

  // Color palette for pie charts
  private readonly pieColors = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

  ngOnInit(): void {
    this.loadAIStats();
  }

  private loadAIStats(): void {
    this.dashboardService.getAIStats().subscribe({
      next: (stats) => this.handleStats(stats),
      error: (err) => {
        console.error('Failed to load AI stats:', err);
        this.isLoading = false;
      }
    });
  }

  private handleStats(stats: AIStats): void {
    // --- Summary cards ---
    this.totalQueries = stats.totalQueries;
    this.answerRate = stats.answerRate;
    this.averageResponseTimeMs = stats.averageResponseTimeMs;
    this.estimatedOpenAICost = stats.estimatedOpenAICost;

    // Cost warning: show banner if estimated cost exceeds $10
    this.showCostWarning = stats.estimatedOpenAICost > 10;

    // --- Line chart: Queries Per Day ---
    const datePipe = new DatePipe('en-US');
    this.lineChartData.labels = stats.queriesPerDay.map((d: DailyQueryCount) =>
      datePipe.transform(d.date, 'MMM d') ?? d.date
    );
    this.lineChartData.datasets[0].data = stats.queriesPerDay.map((d: DailyQueryCount) => d.count);

    // --- Provider pie chart ---
    const providerEntries = Object.entries(stats.providerBreakdown);
    this.providerPieData.labels = providerEntries.map(([key]) => this.formatLabel(key));
    this.providerPieData.datasets[0] = {
      data: providerEntries.map(([, value]) => value),
      backgroundColor: this.pieColors.slice(0, providerEntries.length)
    };

    // --- Language pie chart ---
    const languageEntries = Object.entries(stats.languageBreakdown);
    this.languagePieData.labels = languageEntries.map(([key]) => this.formatLabel(key));
    this.languagePieData.datasets[0] = {
      data: languageEntries.map(([, value]) => value),
      backgroundColor: this.pieColors.slice(0, languageEntries.length)
    };

    // Refresh chart rendering
    this.chart?.update();
    this.isLoading = false;
    // Force change detection to update charts
    this.cdr.detectChanges();
  }

  /**
   * Formats provider/language keys for display.
   * e.g. "OPENAI" → "OpenAI", "en" → "English", "fr" → "French", "ar" → "Arabic"
   */
  private formatLabel(key: string): string {
    const labelMap: Record<string, string> = {
      'OPENAI': 'OpenAI',
      'OLLAMA': 'Ollama',
      'en': 'English',
      'fr': 'French',
      'ar': 'Arabic'
    };
    return labelMap[key] ?? key;
  }
}