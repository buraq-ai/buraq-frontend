import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';
import { AiQueryService } from '../../../core/services/ai-query';
import { AIQueryResponse, QueryHistoryItem } from '../../../core/models/ai-query.models';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../core/services/notification';

type UIState = 'idle' | 'loading' | 'result';

@Component({
  selector: 'app-ai-query',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, RouterModule],
  templateUrl: './ai-query.html',
  styleUrl: './ai-query.css',
})
export class AiQueryComponent {

  //── Form State ─────────────────────────────────────────────────────────────
  question: string = '';
  selectedLanguage: string = 'en';

  // ── UI State ───────────────────────────────────────────────────────────────
  uiState: UIState = 'idle';

  // ── Result State ───────────────────────────────────────────────────────────
  currentResponse: AIQueryResponse | null = null;

  // ── History State ──────────────────────────────────────────────────────────
  queryHistory: QueryHistoryItem[] = [];
  expandedHistoryIndex: number | null = null;

  // ── Citation State ─────────────────────────────────────────────────────────
  expandedCitationIndex: number | null = null;

  constructor(
    private aiQueryService: AiQueryService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService
  ) { }

  // ── Getters ────────────────────────────────────────────────────────────────

  get isLoading(): boolean {
    return this.uiState === 'loading';
  }

  get canSubmit(): boolean {
    return this.question.trim().length > 0 && !this.isLoading;
  }

  get confidenceLabel(): string {
    if (!this.currentResponse) return '';
    const score = this.currentResponse.confidence_score;
    if (score >= 0.7) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  submitQuery(): void {
    if (!this.canSubmit) return;

    const questionSnapshot = this.question.trim();
    this.uiState = 'loading';
    this.currentResponse = null;
    this.expandedCitationIndex = null;

    this.aiQueryService.query(questionSnapshot, this.selectedLanguage).subscribe({
      next: (response: AIQueryResponse) => {
        this.currentResponse = response;
        this.uiState = 'result';
        this.question = '';
        this.queryHistory.unshift({
          question: questionSnapshot,
          response,
          timestamp: new Date()
        });
        this.cdr.detectChanges();

        // Refresh notification count if a ticket was created
        if (response.ticket_created) {
          this.notificationService.refreshUnreadCount();
          // Small delay to let the HTTP call complete, then trigger change detection
          setTimeout(() => this.cdr.detectChanges(), 500);
        }
      },
      error: () => {
        this.currentResponse = {
          question: questionSnapshot,
          answer: 'An unexpected error occurred. Please try again.',
          sources: [],
          has_answer: false,
          confidence_score: 0,
          language_detected: this.selectedLanguage,
          should_create_ticket: true,
          ticket_created: false,
          ticket_id: null
        };
        this.uiState = 'result';
        this.cdr.detectChanges();
      }
    });
  }

  toggleCitation(index: number): void {
    this.expandedCitationIndex =
      this.expandedCitationIndex === index ? null : index;
  }

  toggleHistoryItem(index: number): void {
    this.expandedHistoryIndex =
      this.expandedHistoryIndex === index ? null : index;
  }

  isCitationExpanded(index: number): boolean {
    return this.expandedCitationIndex === index;
  }

  isHistoryItemExpanded(index: number): boolean {
    return this.expandedHistoryIndex === index;
  }
}