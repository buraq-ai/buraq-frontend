// Represents a single source document chunk returned by the RAG pipeline
export interface SourceChunk {
  document_id: number;
  filename: string;
  chunk_index: number;
  page_number: number;
  excerpt: string;
}

// The request payload sent to Spring Boot
export interface AIQueryRequest {
  question: string;
  language: string;
}

// The full response received from Spring Boot
export interface AIQueryResponse {
  question: string;
  answer: string;
  sources: SourceChunk[];
  has_answer: boolean;
  confidence_score: number;
  language_detected: string;
  should_create_ticket: boolean;
  ticket_created: boolean;
}

// Represents a single entry in the session query history
export interface QueryHistoryItem {
  question: string;
  response: AIQueryResponse;
  timestamp: Date;
}