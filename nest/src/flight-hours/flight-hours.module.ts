import { Module } from '@nestjs/common';
import { FlightHoursController } from './flight-hours.controller';
import { FlightHoursService } from './flight-hours.service';
import { PilotController } from './pilot.controller';

@Module({
  controllers: [FlightHoursController, PilotController],
  providers: [FlightHoursService],
})
export class FlightHoursModule {}
