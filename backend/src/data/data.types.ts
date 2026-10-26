// Shapes of the mock JSON files supplied with the brief.

export interface LegendEntry {
  code: string;
  label: string;
  color: string;
}

export interface RawSchedule {
  id: string;
  duty_date: string;
  status: number;
  base_name: string;
  base_color: string;
  duty_type: string;
  count_schedules: number;
  count_logbooks: number;
}

export interface SchedulesFile {
  today: string;
  fieldGuide: Record<string, string>;
  legend: LegendEntry[];
  schedules: RawSchedule[];
}

export interface RawDocument {
  id: string;
  label: string;
  expiryDate: string;
}

export interface DocumentsFile {
  today: string;
  thresholds: { warningDays: number; comment?: string };
  documents: RawDocument[];
}

export interface ChartBound {
  limit: number;
  max: number;
  windowDays: number;
  displayRangeDays: number;
}

export interface FlightHoursFile {
  pilot: { name: string; totalFlightHours: number };
  limits: { daily: number; weekly: number; monthly: number; annual: number };
  chartBounds: Record<string, ChartBound>;
  flightHours: { date: string; hours: number }[];
}
