import { Controller, Get } from '@nestjs/common';
import { FlightHoursService } from './flight-hours.service';

@Controller('pilot')
export class PilotController {
  constructor(private readonly flightHours: FlightHoursService) {}

  /** GET /api/pilot */
  @Get()
  profile() {
    return {
      ...this.flightHours.pilot,
      limits: this.flightHours.limits,
      ranges: this.flightHours.ranges,
      dataFrom: this.flightHours.firstDate,
      dataTo: this.flightHours.lastDate,
    };
  }
}
