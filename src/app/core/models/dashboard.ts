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

export interface DailyQueryCount {
  date: string;
  count: number;
}

export interface AIStats {
  totalQueries: number;
  queriesWithAnswer: number;
  queriesWithoutAnswer: number;
  answerRate: number;
  averageResponseTimeMs: number;
  averageConfidenceScore: number;
  queriesPerDay: DailyQueryCount[];
  providerBreakdown: Record<string, number>;
  languageBreakdown: Record<string, number>;
  estimatedOpenAICost: number;
}

export interface ServiceHealth {
  serviceName: string;
  status: string;          // "UP" or "DOWN"
  responseTimeMs: number | null;  // null when service is DOWN
  details: string;
  lastCheckedAt: string;
}

export interface SystemHealth {
  overallStatus: string;   // "UP" or "DOWN"
  services: ServiceHealth[];
  checkedAt: string;
}