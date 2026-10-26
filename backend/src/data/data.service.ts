import { Injectable, OnModuleInit } from '@nestjs/common';
import { DocumentsFile, FlightHoursFile, SchedulesFile } from './data.types';
// Imported (not read from disk) so the data is bundled with the code,
// which keeps it working on serverless hosts such as Vercel.
import documentsJson from './mock/mock-documents.json';
import flightHoursJson from './mock/mock-flight-hours.json';
import schedulesJson from './mock/mock-schedules.json';

/**
 * Holds the mock data in memory.
 * This is the only place that knows where the data comes from, so it can be
 * swapped for a database repository later without touching the feature modules.
 */
@Injectable()
export class DataService implements OnModuleInit {
  schedules: SchedulesFile;
  documents: DocumentsFile;
  flightHours: FlightHoursFile;

  onModuleInit() {
    // Deep copies so sorting never mutates the imported modules.
    this.schedules = structuredClone(schedulesJson) as SchedulesFile;
    this.documents = structuredClone(documentsJson) as DocumentsFile;
    this.flightHours = structuredClone(flightHoursJson) as FlightHoursFile;
    // Sort once so every consumer can rely on chronological order.
    this.flightHours.flightHours.sort((a, b) => a.date.localeCompare(b.date));
    this.schedules.schedules.sort((a, b) => a.duty_date.localeCompare(b.duty_date));
  }
}
