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