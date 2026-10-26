<script setup lang="ts">
const store = useDashboardStore();
</script>

<template>
  <section class="card" aria-labelledby="up-title">
    <div class="card-head">
      <h2 id="up-title" class="card-title">Next Duties</h2>
      <span class="card-sub">from {{ store.schedules ? formatShort(store.schedules.today) : '—' }}</span>
    </div>
    <SectionState
      :loading="store.status.schedules.loading && !store.schedules"
      :error="store.status.schedules.error"
      :height="200"
      @retry="store.loadSchedules()"
    />
    <ul v-if="store.schedules" class="list">
      <li v-for="d in store.upcoming" :key="d.id">
        <button type="button" class="row" @click="store.selectDate(d.date)">
          <span class="date">
            <b>{{ parts(d.date).d }}</b>
            <small>{{ weekday(d.date) }}</small>
          </span>
          <span class="chip" :style="{ background: d.color, color: textOn(d.color) }">{{ d.code }}</span>
          <span class="what">
            {{ d.dutyLabel }}
            <small v-if="d.dutyType === 'DTY'">{{ d.scheduled }} flight{{ d.scheduled === 1 ? '' : 's' }}</small>
            <small v-else>{{ d.location }}</small>
          </span>
          <span v-if="d.complete" class="pill safe">Logged</span>
          <span v-else class="pill neutral">{{ d.logged }}/{{ d.scheduled }}</span>
        </button>
      </li>
      <li v-if="!store.upcoming.length" class="empty">No upcoming duties.</li>
    </ul>
  </section>
</template>

<style scoped>
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 0;
  background: transparent;
  padding: 8px;
  border-radius: 10px;
  text-align: left;
}
.row:hover {
  background: var(--bg);
}
.date {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 34px;
  line-height: 1.1;
}
.date b {
  font-size: 18px;
  color: var(--navy);
}
.date small {
  font-size: 11px;
  color: var(--muted);
}
.chip {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  min-width: 42px;
  text-align: center;
}
.what {
  flex: 1;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.25;
}
.what small {
  font-weight: 400;
  color: var(--muted);
  font-size: 12px;
}
.empty {
  color: var(--muted);
  font-size: 14px;
}
</style>
