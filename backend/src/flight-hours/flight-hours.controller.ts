import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { isIsoDate } from '../common/date.util';
import { FlightHoursService } from './flight-hours.service';

@Controller('flight-hours')
export class FlightHoursController {
  constructor(private readonly flightHours: FlightHoursService) {}

  /** GET /api/flight-hours?range=1w&endDate=2026-05-31 */
  @Get()
  series(@Query('range') range = '1w', @Query('endDate') endDate?: string) {
    return this.flightHours.series(range, this.checkDate(endDate));
  }

  /** GET /api/flight-hours/summary?endDate=2026-05-31 */
  @Get('summary')
  summary(@Query('endDate') endDate?: string) {
    const date = this.checkDate(endDate);
    return {
      endDate: date ?? this.flightHours.lastDate,
      limits: this.flightHours.limits,
      windows: this.flightHours.summary(date),
    };
  }

  private checkDate(endDate?: string): string | undefined {
    if (endDate === undefined) return undefined;
    if (!isIsoDate(endDate)) throw new BadRequestException('endDate must be in YYYY-MM-DD format');
    const { firstDate, lastDate } = this.flightHours;
    if (endDate < firstDate || endDate > lastDate) {
      throw new BadRequestException(`endDate must be between ${firstDate} and ${lastDate}`);
    }
    return endDate;
  }
}
