<script setup lang="ts">
const store = useDashboardStore();
const day = computed(() => store.selectedDay);
const progress = computed(() =>
  day.value && day.value.scheduled > 0 ? day.value.logged / day.value.scheduled : 0,
);

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') store.selectDate(null);
}
onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <Transition name="fade">
    <div v-if="day" class="backdrop" @click.self="store.selectDate(null)">
      <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="day-title">
        <div class="top" :style="{ background: day.color, color: textOn(day.color) }">
          <div>
            <p class="eyebrow">{{ weekday(day.date) }}, {{ formatDate(day.date) }}</p>
            <h3 id="day-title">{{ day.dutyLabel }}</h3>
          </div>
          <button type="button" class="close" aria-label="Close" @click="store.selectDate(null)">✕</button>
        </div>

        <dl class="rows">
          <div><dt>Duty code</dt><dd>{{ day.dutyType }}</dd></div>
          <div><dt>{{ day.dutyType === 'DTY' ? 'Base' : 'Location' }}</dt><dd>{{ day.location }}</dd></div>
          <div>
            <dt>Status</dt>
            <dd>
              <span class="pill" :class="day.status === 'completed' ? 'safe' : 'neutral'">
                {{ day.status === 'completed' ? 'Completed' : 'Upcoming / pending' }}
              </span>
            </dd>
          </div>
          <div>
            <dt>{{ day.dutyType === 'DTY' ? 'Flights logged' : 'Duties logged' }}</dt>
            <dd>{{ day.logged }} / {{ day.scheduled }}</dd>
          </div>
        </dl>

        <div class="bar" role="progressbar" :aria-valuenow="day.logged" aria-valuemin="0" :aria-valuemax="day.scheduled">
          <span :style="{ width: `${progress * 100}%` }" />
        </div>
        <p v-if="!day.complete && day.status === 'completed'" class="note warn">
          {{ day.scheduled - day.logged }} logbook entr{{ day.scheduled - day.logged === 1 ? 'y is' : 'ies are' }} still missing for this day.
        </p>

        <div v-if="day.dataIssues.length" class="note info">
          <strong>Data check</strong>
          <ul>
            <li v-for="(issue, i) in day.dataIssues" :key="i">{{ issue }}</li>
          </ul>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(14, 20, 64, 0.45);
  display: grid;
  place-items: center;
  padding: 16px;
}
.sheet {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(14, 20, 64, 0.3);
}
.top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 18px 20px;
}
.eyebrow {
  font-size: 13px;
  opacity: 0.85;
}
h3 {
  font-size: 22px;
}
.close {
  border: 0;
  background: rgba(255, 255, 255, 0.25);
  width: 30px;
  height: 30px;
  border-radius: 8px;
}
.rows {
  margin: 0;
  padding: 8px 20px 0;
}
.rows div {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}
dt {
  color: var(--muted);
  font-size: 14px;
}
dd {
  margin: 0;
  font-weight: 600;
}
.bar {
  margin: 16px 20px 0;
  height: 8px;
  border-radius: 999px;
  background: var(--bg);
  overflow: hidden;
}
.bar span {
  display: block;
  height: 100%;
  background: var(--ok);
  border-radius: inherit;
}
.note {
  margin: 14px 20px 0;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
}
.note.warn {
  background: var(--warn-bg);
  color: var(--warn);
}
.note.info {
  background: var(--navy-soft);
  color: var(--navy);
}
.note ul {
  margin: 4px 0 0;
  padding-left: 18px;
}
.sheet > :last-child {
  margin-bottom: 20px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
