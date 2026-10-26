<script setup lang="ts">
import type { ScheduleDay } from '~/types/api';

const store = useDashboardStore();
const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Cell {
  date: string;
  day: number;
  inMonth: boolean;
  schedule: ScheduleDay | null;
}

/** 6×7 grid for the selected month, weeks starting on Monday. */
const cells = computed<Cell[]>(() => {
  const month = store.selectedMonth;
  if (!month) return [];
  const [y, m] = month.split('-').map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const offset = (first.getUTCDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const weeks = Math.ceil((offset + daysInMonth) / 7);
  return Array.from({ length: weeks * 7 }, (_, i) => {
    const date = new Date(Date.UTC(y, m - 1, 1 + i - offset));
    const iso = date.toISOString().slice(0, 10);
    return {
      date: iso,
      day: date.getUTCDate(),
      inMonth: iso.startsWith(month),
      schedule: store.scheduleByDate[iso] ?? null,
    };
  });
});

const range = computed(() => store.schedules?.range);
const canPrev = computed(() => !!range.value && store.selectedMonth > range.value.first);
const canNext = computed(() => !!range.value && store.selectedMonth < range.value.last);
const today = computed(() => store.schedules?.today ?? '');

/** Legend entries that actually appear in the data, in legend order. */
const usedLegend = computed(() => {
  const used = new Set((store.schedules?.schedules ?? []).map((s) => s.dutyType));
  return (store.schedules?.legend ?? []).filter((l) => used.has(l.code));
});

function ariaLabel(c: Cell) {
  const s = c.schedule;
  if (!s) return `${formatDate(c.date)}, no duty`;
  return `${formatDate(c.date)}, ${s.dutyLabel} ${s.code}, ${s.logged} of ${s.scheduled} logged`;
}
</script>

<template>
  <section class="card" aria-labelledby="cal-title">
    <div class="card-head">
      <div>
        <h2 id="cal-title" class="card-title">Duty Roster</h2>
        <p class="card-sub">Roster date: {{ today ? formatDate(today) : '—' }}</p>
      </div>
      <div class="nav">
        <button
          type="button"
          class="icon-btn"
          :disabled="!canPrev"
          aria-label="Previous month"
          @click="store.changeMonth(-1)"
        >
          ‹
        </button>
        <span class="month" aria-live="polite">{{ store.selectedMonth ? formatMonth(store.selectedMonth) : '' }}</span>
        <button
          type="button"
          class="icon-btn"
          :disabled="!canNext"
          aria-label="Next month"
          @click="store.changeMonth(1)"
        >
          ›
        </button>
      </div>
    </div>

    <SectionState
      :loading="store.status.schedules.loading && !store.schedules"
      :error="store.status.schedules.error"
      :height="420"
      @retry="store.loadSchedules()"
    />

    <template v-if="store.schedules">
      <div class="stats">
        <div><strong>{{ store.monthStats.dutyDays }}</strong><span>duty days</span></div>
        <div><strong>{{ store.monthStats.flights }}</strong><span>flights planned</span></div>
        <div><strong>{{ store.monthStats.logged }}</strong><span>flights logged</span></div>
        <div><strong>{{ store.monthStats.otherDays }}</strong><span>other duties</span></div>
      </div>

      <div class="grid" role="grid" :aria-label="formatMonth(store.selectedMonth)">
        <div v-for="w in WEEK" :key="w" class="weekday" role="columnheader">{{ w }}</div>
        <button
          v-for="c in cells"
          :key="c.date"
          type="button"
          role="gridcell"
          class="cell"
          :class="{
            out: !c.inMonth,
            filled: !!c.schedule && c.inMonth,
            today: c.date === today,
            selected: c.date === store.selectedDate,
          }"
          :style="c.schedule && c.inMonth ? { background: c.schedule.color, color: textOn(c.schedule.color) } : undefined"
          :disabled="!c.inMonth || !c.schedule"
          :aria-label="ariaLabel(c)"
          @click="store.selectDate(c.date)"
        >
          <span class="day">{{ c.day }}</span>
          <template v-if="c.schedule && c.inMonth">
            <span v-if="c.schedule.complete" class="badge tick" title="All logged">
              <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true">
                <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <span v-else class="badge" :title="`${c.schedule.logged}/${c.schedule.scheduled} logged`">
              {{ c.schedule.scheduled }}
            </span>
            <span class="code">{{ c.schedule.code }}</span>
          </template>
        </button>
      </div>

      <ul class="legend" aria-label="Legend">
        <li v-for="l in usedLegend" :key="l.code">
          <span class="swatch" :style="{ background: l.color }" />
          <b>{{ l.code }}</b> {{ l.label }}
        </li>
      </ul>
      <p class="hint">
        Number = flights scheduled · tick = all flights logged · click a day for details
      </p>
    </template>
  </section>
</template>

<style scoped>
.nav {
  display: flex;
  align-items: center;
  gap: 10px;
}
.month {
  min-width: 128px;
  text-align: center;
  font-weight: 600;
  color: var(--navy);
}
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}
.stats div {
  background: var(--bg);
  border-radius: 10px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
}
.stats strong {
  font-size: 20px;
  color: var(--navy);
  line-height: 1.2;
}
.stats span {
  font-size: 12px;
  color: var(--muted);
}
.grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
}
.weekday {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  padding-bottom: 4px;
}
.cell {
  position: relative;
  aspect-ratio: 1 / 0.86;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #fff;
  padding: 6px 7px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  text-align: left;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.cell:disabled {
  cursor: default;
}
.cell.out {
  background: transparent;
  border-color: transparent;
  color: var(--faint);
}
.cell.filled {
  border-color: transparent;
}
.cell.filled:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(14, 20, 64, 0.15);
}
.cell.today {
  outline: 2px solid var(--navy);
  outline-offset: 2px;
}
.cell.selected {
  box-shadow: 0 0 0 3px var(--red);
}
.day {
  font-size: 13px;
  font-weight: 600;
}
.badge {
  position: absolute;
  top: 5px;
  right: 5px;
  min-width: 19px;
  height: 19px;
  padding: 0 5px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--navy-deep);
  font-size: 11px;
  font-weight: 700;
  display: grid;
  place-items: center;
}
.badge.tick {
  color: var(--ok);
}
.code {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.legend {
  list-style: none;
  padding: 0;
  margin: 16px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  font-size: 12px;
  color: var(--muted);
}
.legend li {
  display: flex;
  align-items: center;
  gap: 6px;
}
.legend b {
  color: var(--text);
}
.swatch {
  width: 12px;
  height: 12px;
  border-radius: 4px;
}
.hint {
  margin-top: 10px;
  font-size: 12px;
  color: var(--faint);
}
@media (max-width: 640px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .grid {
    gap: 3px;
  }
  .cell {
    padding: 3px 4px;
    border-radius: 7px;
    aspect-ratio: 1 / 1.05;
  }
  .day,
  .code {
    font-size: 10px;
  }
  .badge {
    top: 2px;
    right: 2px;
    min-width: 15px;
    height: 15px;
    font-size: 9px;
    padding: 0 3px;
  }
}
</style>
