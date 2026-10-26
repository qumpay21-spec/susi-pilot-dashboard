import { BadRequestException, Injectable } from '@nestjs/common';
import { addDays } from '../common/date.util';
import { DataService } from '../data/data.service';
import { ChartBound } from '../data/data.types';

export interface FlightHoursPoint {
  date: string;
  /** Hours flown on this day. */
  daily: number;
  /** Total hours in the rolling window that ends on this day. */
  total: number;
  /** Share of the limit used, 0..1+. */
  usage: number;
  level: 'ok' | 'warning' | 'exceeded';
}

/** Above this share of the limit a bar is shown as a warning. */
const WARNING_RATIO = 0.9;

const round1 = (n: number) => Math.round(n * 10) / 10;

@Injectable()
export class FlightHoursService {
  /** Daily hours by date, for O(1) lookups when summing windows. */
  private byDate = new Map<string, number>();

  constructor(private readonly data: DataService) {}

  private get file() {
    return this.data.flightHours;
  }

  private hoursOn(date: string): number {
    if (this.byDate.size === 0) {
      for (const { date: d, hours } of this.file.flightHours) {
        this.byDate.set(d, (this.byDate.get(d) ?? 0) + hours);
      }
    }
    return this.byDate.get(date) ?? 0;
  }

  get ranges(): string[] {
    return Object.keys(this.file.chartBounds);
  }

  /** Latest date in the data set; used as "today" for the chart. */
  get lastDate(): string {
    const list = this.file.flightHours;
    return list[list.length - 1]?.date ?? new Date().toISOString().slice(0, 10);
  }

  get firstDate(): string {
    return this.file.flightHours[0]?.date ?? this.lastDate;
  }

  get pilot() {
    return this.file.pilot;
  }

  get limits() {
    return this.file.limits;
  }

  bound(range: string): ChartBound {
    const bound = this.file.chartBounds[range];
    if (!bound) {
      throw new BadRequestException(`range must be one of: ${this.ranges.join(', ')}`);
    }
    return bound;
  }

  /** Sum of hours in the `windowDays` days ending on `endDate` (inclusive). */
  windowTotal(endDate: string, windowDays: number): number {
    let total = 0;
    for (let i = 0; i < windowDays; i++) total += this.hoursOn(addDays(endDate, -i));
    return round1(total);
  }

  /**
   * One bar per day for the last `displayRangeDays` days.
   * Each bar is the rolling total for the selected window (7, 30, 90, 180 or 365 days),
   * which is how flight-time limits are checked: "hours in the last N days".
   */
  series(range: string, endDate = this.lastDate) {
    const bound = this.bound(range);
    const points: FlightHoursPoint[] = [];
    for (let i = bound.displayRangeDays - 1; i >= 0; i--) {
      const date = addDays(endDate, -i);
      const total = this.windowTotal(date, bound.windowDays);
      const usage = bound.limit > 0 ? total / bound.limit : 0;
      points.push({
        date,
        daily: round1(this.hoursOn(date)),
        total,
        usage: Math.round(usage * 1000) / 1000,
        level: usage > 1 ? 'exceeded' : usage >= WARNING_RATIO ? 'warning' : 'ok',
      });
    }
    const current = points[points.length - 1];
    return {
      range,
      endDate,
      ...bound,
      current: current?.total ?? 0,
      remaining: round1(Math.max(0, bound.limit - (current?.total ?? 0))),
      points,
    };
  }

  /** Current totals for every window, for the summary tiles. */
  summary(endDate = this.lastDate) {
    return this.ranges.map((range) => {
      const bound = this.bound(range);
      const total = this.windowTotal(endDate, bound.windowDays);
      return {
        range,
        windowDays: bound.windowDays,
        limit: bound.limit,
        total,
        remaining: round1(Math.max(0, bound.limit - total)),
        usage: bound.limit > 0 ? Math.round((total / bound.limit) * 1000) / 1000 : 0,
      };
    });
  }
}
