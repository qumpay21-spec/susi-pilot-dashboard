// Response shapes of the NestJS API.

export interface LegendEntry {
  code: string;
  label: string;
  color: string;
}

export interface ScheduleDay {
  id: string;
  date: string;
  dutyType: string;
  dutyLabel: string;
  code: string;
  location: string;
  color: string;
  status: 'pending' | 'completed';
  scheduled: number;
  logged: number;
  complete: boolean;
  dataIssues: string[];
}

export interface SchedulesResponse {
  today: string;
  month: string | null;
  range: { first: string; last: string };
  legend: LegendEntry[];
  schedules: ScheduleDay[];
}

export type DocumentStatus = 'expired' | 'soon' | 'safe';

export interface PilotDocument {
  id: string;
  label: string;
  expiryDate: string;
  daysRemaining: number;
  status: DocumentStatus;
}

export interface DocumentsResponse {
  today: string;
  warningDays: number;
  summary: Record<DocumentStatus, number>;
  documents: PilotDocument[];
}

export type RangeKey = '1w' | '1m' | '3m' | '6m' | '1y';

export interface FlightHoursPoint {
  date: string;
  daily: number;
  total: number;
  usage: number;
  level: 'ok' | 'warning' | 'exceeded';
}

export interface FlightHoursSeries {
  range: RangeKey;
  endDate: string;
  limit: number;
  max: number;
  windowDays: number;
  displayRangeDays: number;
  current: number;
  remaining: number;
  points: FlightHoursPoint[];
}

export interface FlightHoursSummary {
  endDate: string;
  limits: { daily: number; weekly: number; monthly: number; annual: number };
  windows: {
    range: RangeKey;
    windowDays: number;
    limit: number;
    total: number;
    remaining: number;
    usage: number;
  }[];
}

export interface PilotProfile {
  name: string;
  totalFlightHours: number;
  limits: FlightHoursSummary['limits'];
  ranges: RangeKey[];
  dataFrom: string;
  dataTo: string;
}
