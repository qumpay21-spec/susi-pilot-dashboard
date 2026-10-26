import { Injectable } from '@nestjs/common';
import { diffDays } from '../common/date.util';
import { DataService } from '../data/data.service';

export type DocumentStatus = 'expired' | 'soon' | 'safe';

export interface PilotDocument {
  id: string;
  label: string;
  expiryDate: string;
  daysRemaining: number;
  status: DocumentStatus;
}

@Injectable()
export class DocumentsService {
  constructor(private readonly data: DataService) {}

  get today(): string {
    return this.data.documents.today;
  }

  get warningDays(): number {
    return this.data.documents.thresholds.warningDays;
  }

  /**
   * Rules from the brief:
   * daysRemaining <= 0 → expired, 0 < daysRemaining <= warningDays → soon, else safe.
   * Sorted so the most urgent document comes first.
   */
  findAll(today = this.today): PilotDocument[] {
    return this.data.documents.documents
      .map((doc) => {
        const daysRemaining = diffDays(today, doc.expiryDate);
        return {
          ...doc,
          daysRemaining,
          status: this.statusFor(daysRemaining),
        };
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }

  private statusFor(daysRemaining: number): DocumentStatus {
    if (daysRemaining <= 0) return 'expired';
    if (daysRemaining <= this.warningDays) return 'soon';
    return 'safe';
  }
}
