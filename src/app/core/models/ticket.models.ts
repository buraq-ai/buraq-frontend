export interface TicketResponse {
  id: number;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  source: 'AI_FALLBACK' | 'MANUAL';
  created_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

// Request DTO for assigning a ticket
export interface AssignTicketRequest {
  agentEmail: string;
}

// Generic paginated response from the backend
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

// Parameters for filtering assigned/all tickets
export interface TicketFilterParams {
  status?: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  fromDate?: string;   // format: 'YYYY-MM-DD'
  toDate?: string;     // format: 'YYYY-MM-DD'
  page?: number;
  size?: number;
}