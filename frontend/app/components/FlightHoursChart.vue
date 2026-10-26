<script setup lang="ts">
import type { FlightHoursPoint, RangeKey } from '~/types/api';

const store = useDashboardStore();

const RANGES: { key: RangeKey; label: string; long: string }[] = [
  { key: '1w', label: '1W', long: '7 days' },
  { key: '1m', label: '1M', long: '30 days' },
  { key: '3m', label: '3M', long: '90 days' },
  { key: '6m', label: '6M', long: '180 days' },
  { key: '1y', label: '1Y', long: '365 days' },
];

const LEVEL_COLOR = { ok: '#1B2559', warning: '#F59E0B', exceeded: '#E0313F' } as const;

// Chart geometry (SVG units; the SVG scales to its container).
const W = 640;
const H = 260;
const PAD = { top: 18, right: 58, bottom: 44, left: 40 };
const plotW = W - PAD.left - PAD.right;
const plotH = H - PAD.top - PAD.bottom;

const series = computed(() => store.currentSeries);
const hovered = ref<number | null>(null);
watch(() => store.selectedRange, () => (hovered.value = null));

const yMax = computed(() => series.value?.max ?? 1);
const y = (v: number) => PAD.top + plotH - (Math.min(v, yMax.value) / yMax.value) * plotH;

const ticks = computed(() => {
  const max = yMax.value;
  const step = niceStep(max / 5);
  const out: number[] = [];
  for (let v = 0; v <= max + 0.001; v += step) out.push(Math.round(v));
  return out;
});

function niceStep(raw: number) {
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * pow;
}

const bars = computed(() => {
  const pts = series.value?.points ?? [];
  const slot = plotW / Math.max(pts.length, 1);
  const bw = Math.min(54, slot * 0.58);
  return pts.map((p, i) => {
    const x = PAD.left + slot * i + (slot - bw) / 2;
    const top = y(p.total);
    return { ...p, x, w: bw, cx: x + bw / 2, top, h: PAD.top + plotH - top, i };
  });
});

const active = computed<FlightHoursPoint | null>(() => {
  const pts = series.value?.points ?? [];
  return pts[hovered.value ?? pts.length - 1] ?? null;
});

const rangeLong = computed(() => RANGES.find((r) => r.key === store.selectedRange)?.long ?? '');

const LEVEL_TEXT = { ok: 'Within limit', warning: 'Near limit', exceeded: 'Limit exceeded' } as const;
</script>

<template>
  <section class="card" aria-labelledby="fh-title">
    <div class="card-head">
      <div>
        <h2 id="fh-title" class="card-title">Flight Time vs Limits</h2>
        <p class="card-sub">
          Rolling total of the last {{ rangeLong }}, shown for each of the last 7 days
        </p>
      </div>
      <div class="tabs" role="tablist" aria-label="Limit window">
        <button
          v-for="r in RANGES"
          :key="r.key"
          type="button"
          role="tab"
          :aria-selected="store.selectedRange === r.key"
          :class="{ on: store.selectedRange === r.key }"
          @click="store.selectRange(r.key)"
        >
          {{ r.label }}
        </button>
      </div>
    </div>

    <SectionState
      :loading="store.status.flightHours.loading && !series"
      :error="store.status.flightHours.error"
      :height="260"
      @retry="store.loadFlightHours()"
    />

    <div v-if="series" class="body">
      <div class="headline">
        <div>
          <span class="big">{{ series.current.toFixed(1) }}</span>
          <span class="of">/ {{ series.limit }} h</span>
        </div>
        <span class="pill" :class="series.points.at(-1)?.level ?? 'ok'">
          {{ series.remaining.toFixed(1) }} h remaining
        </span>
      </div>

      <div class="chart-wrap" @mouseleave="hovered = null">
        <svg :viewBox="`0 0 ${W} ${H}`" class="chart" role="img" :aria-label="`Rolling ${rangeLong} flight hours against a ${series.limit} hour limit`">
          <!-- grid + y axis -->
          <g v-for="t in ticks" :key="t">
            <line :x1="PAD.left" :x2="W - PAD.right" :y1="y(t)" :y2="y(t)" class="grid" />
            <text :x="PAD.left - 8" :y="y(t) + 4" class="axis" text-anchor="end">{{ t }}</text>
          </g>

          <!-- bars -->
          <g v-for="b in bars" :key="b.date" @mouseenter="hovered = b.i" @focus="hovered = b.i" tabindex="0" class="bar-g">
            <rect :x="b.x - 6" :y="PAD.top" :width="b.w + 12" :height="plotH" class="hit" :class="{ on: hovered === b.i }" />
            <rect :x="b.x" :y="b.top" :width="b.w" :height="Math.max(b.h, 1)" rx="5" :fill="LEVEL_COLOR[b.level]" />
            <text :x="b.cx" :y="b.top - 6" text-anchor="middle" class="val">{{ b.total.toFixed(1) }}</text>
            <text :x="b.cx" :y="H - PAD.bottom + 18" text-anchor="middle" class="axis">{{ weekday(b.date) }}</text>
            <text :x="b.cx" :y="H - PAD.bottom + 33" text-anchor="middle" class="axis faint">{{ formatShort(b.date) }}</text>
          </g>

          <!-- limit line -->
          <line :x1="PAD.left" :x2="W - PAD.right" :y1="y(series.limit)" :y2="y(series.limit)" class="limit" />
          <!-- label sits in the right margin so it never covers a bar value -->
          <text :x="W - PAD.right + 6" :y="y(series.limit) - 2" class="limit-label">Limit</text>
          <text :x="W - PAD.right + 6" :y="y(series.limit) + 11" class="limit-label">{{ series.limit }} h</text>
        </svg>
      </div>

      <div v-if="active" class="detail" aria-live="polite">
        <span><b>{{ weekday(active.date) }}, {{ formatDate(active.date) }}</b></span>
        <span>Flown that day: <b>{{ active.daily.toFixed(1) }} h</b></span>
        <span>Last {{ rangeLong }}: <b>{{ active.total.toFixed(1) }} h</b> ({{ Math.round(active.usage * 100) }}%)</span>
        <span class="pill" :class="active.level">{{ LEVEL_TEXT[active.level] }}</span>
      </div>

      <div class="key">
        <span><i :style="{ background: LEVEL_COLOR.ok }" /> Within limit</span>
        <span><i :style="{ background: LEVEL_COLOR.warning }" /> ≥ 90% of limit</span>
        <span><i :style="{ background: LEVEL_COLOR.exceeded }" /> Over limit</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tabs {
  display: inline-flex;
  background: var(--bg);
  border-radius: 10px;
  padding: 3px;
}
.tabs button {
  border: 0;
  background: transparent;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
}
.tabs button.on {
  background: #fff;
  color: var(--navy);
  box-shadow: 0 1px 3px rgba(14, 20, 64, 0.12);
}
.headline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}
.big {
  font-size: 30px;
  font-weight: 700;
  color: var(--navy);
}
.of {
  color: var(--muted);
  margin-left: 4px;
}
.chart-wrap {
  width: 100%;
}
.chart {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
}
.grid {
  stroke: #eceff6;
}
.axis {
  font-size: 11px;
  fill: var(--muted);
}
.axis.faint {
  fill: var(--faint);
}
.val {
  font-size: 11px;
  font-weight: 700;
  fill: var(--text);
}
.limit {
  stroke: var(--red);
  stroke-width: 1.5;
  stroke-dasharray: 6 4;
}
.limit-label {
  font-size: 11px;
  font-weight: 700;
  fill: var(--red);
}
.hit {
  fill: transparent;
  rx: 8;
}
.hit.on {
  fill: rgba(27, 37, 89, 0.06);
}
.bar-g {
  outline: none;
  cursor: default;
}
.detail {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 18px;
  font-size: 13px;
  color: var(--muted);
  background: var(--bg);
  border-radius: 10px;
  padding: 10px 12px;
  margin-top: 8px;
}
.detail b {
  color: var(--text);
}
.key {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 12px;
  font-size: 12px;
  color: var(--muted);
}
.key i {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 3px;
  margin-right: 5px;
  vertical-align: -1px;
}
</style>
