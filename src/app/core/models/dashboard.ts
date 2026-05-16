export interface DailyTicketCount {
  date: string;
  count: number;
}

export interface TicketStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  closedTickets: number;
  averageResolutionTimeHours: number;
  slaBreachedTickets: number;
  ticketsPerDay: DailyTicketCount[];
}

export interface AgentStats {
  agentEmail: string;
  totalAssigned: number;
  totalClosed: number;
  averageResolutionTimeHours: number;
  resolutionRate: number;
}