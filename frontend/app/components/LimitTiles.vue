<script setup lang="ts">
import type { RangeKey } from '~/types/api';

const store = useDashboardStore();
const NAMES: Record<RangeKey, string> = {
  '1w': 'Last 7 days',
  '1m': 'Last 30 days',
  '3m': 'Last 90 days',
  '6m': 'Last 180 days',
  '1y': 'Last 365 days',
};

function level(usage: number) {
  return usage > 1 ? 'exceeded' : usage >= 0.9 ? 'warning' : 'ok';
}
</script>

<template>
  <div v-if="store.summary" class="tiles">
    <button
      v-for="w in store.summary.windows"
      :key="w.range"
      type="button"
      class="tile"
      :class="[level(w.usage), { on: store.selectedRange === w.range }]"
      :aria-pressed="store.selectedRange === w.range"
      @click="store.selectRange(w.range)"
    >
      <span class="name">{{ NAMES[w.range] ?? w.range }}</span>
      <span class="value">{{ w.total.toFixed(1) }}<small> / {{ w.limit }} h</small></span>
      <span class="track"><span :style="{ width: `${Math.min(w.usage, 1) * 100}%` }" /></span>
      <span class="pct">{{ Math.round(w.usage * 100) }}% used</span>
    </button>
  </div>
</template>

<style scoped>
.tiles {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}
.tile {
  text-align: left;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: var(--shadow);
  transition: border-color 0.12s ease;
}
.tile.on {
  border-color: var(--navy);
}
.name {
  font-size: 12px;
  color: var(--muted);
}
.value {
  font-size: 20px;
  font-weight: 700;
  color: var(--navy);
}
.value small {
  font-size: 12px;
  font-weight: 500;
  color: var(--muted);
}
.track {
  height: 6px;
  border-radius: 999px;
  background: var(--bg);
  overflow: hidden;
}
.track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--navy);
}
.warning .track span {
  background: #f59e0b;
}
.exceeded .track span {
  background: var(--red);
}
.pct {
  font-size: 12px;
  color: var(--muted);
}
.warning .pct {
  color: var(--warn);
  font-weight: 600;
}
.exceeded .pct {
  color: var(--bad);
  font-weight: 600;
}
@media (max-width: 900px) {
  .tiles {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
