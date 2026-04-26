import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AIQueryRequest, AIQueryResponse } from '../models/ai-query.models';

@Injectable({
  providedIn: 'root'
})
export class AiQueryService {

  private readonly apiUrl = 'http://localhost:8081/api/ai';

  constructor(private http: HttpClient) {}

  /**
   * Send a question to the AI query endpoint.
   * @param question - The employee's natural language question
   * @param language - Language code: 'en', 'fr', or 'ar'
   * @returns Observable of AIQueryResponse containing answer, sources, and metadata
   */
  query(question: string, language: string): Observable<AIQueryResponse> {
    const payload: AIQueryRequest = { question, language };
    return this.http.post<AIQueryResponse>(`${this.apiUrl}/query`, payload);
  }
}