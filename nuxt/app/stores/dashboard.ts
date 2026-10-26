import { defineStore } from 'pinia';
import type {
  DocumentsResponse,
  FlightHoursSeries,
  FlightHoursSummary,
  PilotProfile,
  RangeKey,
  ScheduleDay,
  SchedulesResponse,
} from '~/types/api';

/** Loading/error state kept separately for each card, so one failing call doesn't blank the page. */
interface Section {
  loading: boolean;
  error: string | null;
}
const section = (): Section => ({ loading: false, error: null });
type SectionKey = 'pilot' | 'schedules' | 'documents' | 'flightHours';

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    pilot: null as PilotProfile | null,
    schedules: null as SchedulesResponse | null,
    documents: null as DocumentsResponse | null,
    summary: null as FlightHoursSummary | null,
    /** Series cached per range so switching tabs back is instant. */
    series: {} as Partial<Record<RangeKey, FlightHoursSeries>>,
    selectedRange: '1w' as RangeKey,
    selectedMonth: '' as string,
    selectedDate: null as string | null,
    status: {
      pilot: section(),
      schedules: section(),
      documents: section(),
      flightHours: section(),
    },
  }),

  getters: {
    scheduleByDate(state): Record<string, ScheduleDay> {
      const map: Record<string, ScheduleDay> = {};
      for (const s of state.schedules?.schedules ?? []) map[s.date] = s;
      return map;
    },
    selectedDay(): ScheduleDay | null {
      return this.selectedDate ? (this.scheduleByDate[this.selectedDate] ?? null) : null;
    },
    currentSeries(state): FlightHoursSeries | null {
      return state.series[state.selectedRange] ?? null;
    },
    /** Upcoming duties from the roster's "today", for the side list. */
    upcoming(state): ScheduleDay[] {
      const today = state.schedules?.today ?? '';
      return (state.schedules?.schedules ?? []).filter((s) => s.date >= today).slice(0, 5);
    },
    monthStats(state) {
      const list = (state.schedules?.schedules ?? []).filter((s) =>
        s.date.startsWith(state.selectedMonth),
      );
      const duty = list.filter((s) => s.dutyType === 'DTY');
      return {
        dutyDays: duty.length,
        flights: duty.reduce((n, s) => n + s.scheduled, 0),
        logged: duty.reduce((n, s) => n + s.logged, 0),
        otherDays: list.length - duty.length,
      };
    },
  },

  actions: {
    async run(key: SectionKey, task: () => Promise<void>) {
      const s = this.status[key];
      s.loading = true;
      s.error = null;
      try {
        await task();
      } catch (err) {
        s.error = errorMessage(err);
      } finally {
        s.loading = false;
      }
    },

    async loadAll() {
      await Promise.all([
        this.loadPilot(),
        this.loadSchedules(),
        this.loadDocuments(),
        this.loadFlightHours(),
      ]);
    },

    loadPilot() {
      const api = useApi();
      return this.run('pilot', async () => {
        this.pilot = await api<PilotProfile>('/pilot');
      });
    },

    loadSchedules() {
      const api = useApi();
      return this.run('schedules', async () => {
        this.schedules = await api<SchedulesResponse>('/schedules');
        if (!this.selectedMonth) this.selectedMonth = this.schedules.today.slice(0, 7);
      });
    },

    loadDocuments() {
      const api = useApi();
      return this.run('documents', async () => {
        this.documents = await api<DocumentsResponse>('/documents');
      });
    },

    loadFlightHours() {
      const api = useApi();
      return this.run('flightHours', async () => {
        const [summary, series] = await Promise.all([
          api<FlightHoursSummary>('/flight-hours/summary'),
          api<FlightHoursSeries>('/flight-hours', { range: this.selectedRange }),
        ]);
        this.summary = summary;
        this.series[this.selectedRange] = series;
      });
    },

    async selectRange(range: RangeKey) {
      this.selectedRange = range;
      if (this.series[range]) return;
      const api = useApi();
      await this.run('flightHours', async () => {
        this.series[range] = await api<FlightHoursSeries>('/flight-hours', { range });
      });
    },

    changeMonth(delta: number) {
      const range = this.schedules?.range;
      const next = shiftMonth(this.selectedMonth, delta);
      if (range && (next < range.first || next > range.last)) return;
      this.selectedMonth = next;
    },

    selectDate(date: string | null) {
      this.selectedDate = date;
    },
  },
});
