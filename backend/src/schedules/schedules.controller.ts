import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { isIsoDate, isIsoMonth } from '../common/date.util';
import { SchedulesService } from './schedules.service';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedules: SchedulesService) {}

  /** GET /api/schedules?month=2026-05 */
  @Get()
  findAll(@Query('month') month?: string) {
    if (month !== undefined && !isIsoMonth(month)) {
      throw new BadRequestException('month must be in YYYY-MM format');
    }
    return {
      today: this.schedules.today,
      month: month ?? null,
      range: this.schedules.monthRange(),
      legend: this.schedules.legend,
      schedules: this.schedules.findAll(month),
    };
  }

  /** GET /api/schedules/2026-05-15 */
  @Get(':date')
  findOne(@Param('date') date: string) {
    if (!isIsoDate(date)) throw new BadRequestException('date must be in YYYY-MM-DD format');
    return this.schedules.findByDate(date);
  }
}
