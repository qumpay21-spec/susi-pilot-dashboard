import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { isIsoDate } from '../common/date.util';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  /** GET /api/documents?today=2026-05-31 (today is optional; defaults to the dataset date) */
  @Get()
  findAll(@Query('today') today?: string) {
    if (today !== undefined && !isIsoDate(today)) {
      throw new BadRequestException('today must be in YYYY-MM-DD format');
    }
    const asOf = today ?? this.documents.today;
    const documents = this.documents.findAll(asOf);
    return {
      today: asOf,
      warningDays: this.documents.warningDays,
      summary: {
        expired: documents.filter((d) => d.status === 'expired').length,
        soon: documents.filter((d) => d.status === 'soon').length,
        safe: documents.filter((d) => d.status === 'safe').length,
      },
      documents,
    };
  }
}
