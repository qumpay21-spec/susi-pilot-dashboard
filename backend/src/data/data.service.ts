import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DocumentsFile, FlightHoursFile, SchedulesFile } from './data.types';

/**
 * Loads the mock JSON files once at startup and keeps them in memory.
 * This is the only place that knows where the data comes from, so it can be
 * swapped for a database repository later without touching the feature modules.
 */
@Injectable()
export class DataService implements OnModuleInit {
  private readonly logger = new Logger(DataService.name);
  private readonly dataDir = process.env.DATA_DIR ?? join(process.cwd(), 'data');

  schedules: SchedulesFile;
  documents: DocumentsFile;
  flightHours: FlightHoursFile;

  onModuleInit() {
    this.schedules = this.load<SchedulesFile>('mock-schedules.json');
    this.documents = this.load<DocumentsFile>('mock-documents.json');
    this.flightHours = this.load<FlightHoursFile>('mock-flight-hours.json');
    // Sort once so every consumer can rely on chronological order.
    this.flightHours.flightHours.sort((a, b) => a.date.localeCompare(b.date));
    this.schedules.schedules.sort((a, b) => a.duty_date.localeCompare(b.duty_date));
  }

  private load<T>(file: string): T {
    const path = join(this.dataDir, file);
    const data = JSON.parse(readFileSync(path, 'utf8')) as T;
    this.logger.log(`Loaded ${file}`);
    return data;
  }
}
