import { Controller, Get, Module } from '@nestjs/common';
import { DataModule } from './data/data.module';
import { DocumentsModule } from './documents/documents.module';
import { FlightHoursModule } from './flight-hours/flight-hours.module';
import { SchedulesModule } from './schedules/schedules.module';

@Controller()
class HealthController {
  /** GET /api/health — used by the hosting platform's health check. */
  @Get('health')
  health() {
    return { status: 'ok', time: new Date().toISOString() };
  }
}

@Module({
  imports: [DataModule, SchedulesModule, DocumentsModule, FlightHoursModule],
  controllers: [HealthController],
})
export class AppModule {}
