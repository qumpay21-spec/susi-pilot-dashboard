import { Injectable, NotFoundException } from '@nestjs/common';
import { DataService } from '../data/data.service';
import { LegendEntry, RawSchedule } from '../data/data.types';

export interface ScheduleDay {
  id: string;
  date: string;
  dutyType: string;
  dutyLabel: string;
  /** Code shown under the day number: the base for DTY days, the duty code otherwise. */
  code: string;
  /** Raw base_name from the data (airport or office code). */
  location: string;
  color: string;
  status: 'pending' | 'completed';
  scheduled: number;
  logged: number;
  /** True when every scheduled flight/duty has been logged (show a tick). */
  complete: boolean;
  /** Notes about data the API had to correct, so nothing is hidden. */
  dataIssues: string[];
}

const FALLBACK_COLOR = '#9CA3AF';

@Injectable()
export class SchedulesService {
  constructor(private readonly data: DataService) {}

  get today(): string {
    return this.data.schedules.today;
  }

  get legend(): LegendEntry[] {
    return this.data.schedules.legend;
  }

  findAll(month?: string): ScheduleDay[] {
    return this.data.schedules.schedules
      .filter((s) => !month || s.duty_date.startsWith(month))
      .map((s) => this.normalize(s));
  }

  findByDate(date: string): ScheduleDay {
    const raw = this.data.schedules.schedules.find((s) => s.duty_date === date);
    if (!raw) throw new NotFoundException(`No duty scheduled on ${date}`);
    return this.normalize(raw);
  }

  /** First and last month that contain schedules, used to bound calendar navigation. */
  monthRange(): { first: string; last: string } {
    const list = this.data.schedules.schedules;
    return {
      first: list[0]?.duty_date.slice(0, 7) ?? this.today.slice(0, 7),
      last: list[list.length - 1]?.duty_date.slice(0, 7) ?? this.today.slice(0, 7),
    };
  }

  /**
   * Turns a raw record into what the calendar needs.
   * The legend is treated as the source of truth for colours: a few records in the
   * mock data carry a colour or base code that does not match their duty type.
   */
  private normalize(s: RawSchedule): ScheduleDay {
    const legend = this.legend.find((l) => l.code === s.duty_type);
    const issues: string[] = [];
    const isDuty = s.duty_type === 'DTY';

    const color = legend?.color ?? s.base_color ?? FALLBACK_COLOR;
    if (legend && s.base_color.toLowerCase() !== legend.color.toLowerCase()) {
      issues.push(
        `Colour ${s.base_color} does not match ${s.duty_type} (${legend.color}); legend colour used.`,
      );
    }
    if (!legend) issues.push(`Unknown duty type ${s.duty_type}.`);

    // Field guide: DTY days show the base code, every other duty shows its duty code.
    // The raw base_name of non-DTY days (e.g. CJN, HLP) is kept as the location.
    const code = isDuty ? s.base_name : s.duty_type;

    const scheduled = Math.max(0, s.count_schedules);
    const logged = Math.min(Math.max(0, s.count_logbooks), scheduled);

    return {
      id: s.id,
      date: s.duty_date,
      dutyType: s.duty_type,
      dutyLabel: legend?.label ?? s.duty_type,
      code,
      location: s.base_name,
      color,
      status: s.status === 2 ? 'completed' : 'pending',
      scheduled,
      logged,
      complete: scheduled > 0 && logged === scheduled,
      dataIssues: issues,
    };
  }
}
