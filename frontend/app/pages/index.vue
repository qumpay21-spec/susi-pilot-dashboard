<script setup lang="ts">
const store = useDashboardStore();
onMounted(() => store.loadAll());

const firstName = computed(() => store.pilot?.name.split(' ')[0] ?? 'Captain');

/** Short alerts shown in the hero so the most urgent items are seen first. */
const alerts = computed(() => {
  const out: { level: 'expired' | 'soon' | 'exceeded' | 'warning'; text: string }[] = [];
  for (const d of store.documents?.documents ?? []) {
    const name = d.label.replace(/ Exp\. Date$| Date$/, '');
    if (d.status === 'expired') out.push({ level: 'expired', text: `${name} has expired` });
    else if (d.status === 'soon') out.push({ level: 'soon', text: `${name} expires in ${d.daysRemaining} days` });
  }
  for (const w of store.summary?.windows ?? []) {
    if (w.usage > 1) out.push({ level: 'exceeded', text: `${w.windowDays}-day flight time over limit` });
    else if (w.usage >= 0.9) out.push({ level: 'warning', text: `${w.windowDays}-day flight time at ${Math.round(w.usage * 100)}% of limit` });
  }
  return out;
});
</script>

<template>
  <main>
    <section class="hero">
      <div class="container hero-inner">
        <div>
          <p class="eyebrow">Pilot Portal</p>
          <h1>Welcome back, {{ firstName }}</h1>
          <p class="lead">Your roster, document validity and flight-time limits in one place.</p>
          <ul v-if="alerts.length" class="alerts" aria-label="Alerts">
            <li v-for="(a, i) in alerts" :key="i" class="pill" :class="a.level">
              <span aria-hidden="true">●</span> {{ a.text }}
            </li>
          </ul>
        </div>
        <div v-if="store.pilot" class="total">
          <span class="total-label">Total flight hours</span>
          <span class="total-value">{{ store.pilot.totalFlightHours.toLocaleString('en-US', { minimumFractionDigits: 1 }) }}</span>
          <span class="total-sub">Daily limit {{ store.pilot.limits.daily }} h · Annual {{ store.pilot.limits.annual }} h</span>
        </div>
      </div>
    </section>

    <div class="container content">
      <LimitTiles />

      <div class="layout">
        <div class="main-col">
          <DutyCalendar />
          <FlightHoursChart />
        </div>
        <aside class="side-col">
          <DocumentList />
          <UpcomingDuties />
        </aside>
      </div>
    </div>

    <DayDetail />
  </main>
</template>

<style scoped>
.hero {
  background: linear-gradient(120deg, var(--navy-deep) 0%, var(--navy) 70%, #2a3a80 100%);
  color: #fff;
  padding: 32px 0 72px;
  position: relative;
  overflow: hidden;
}
.hero::after {
  /* thin brand-red accent line */
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 3px;
  background: var(--red);
}
.hero-inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 24px;
}
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 12px;
  opacity: 0.7;
}
h1 {
  font-size: 30px;
  margin: 4px 0 6px;
}
.lead {
  opacity: 0.8;
}
.alerts {
  list-style: none;
  padding: 0;
  margin: 16px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.alerts .pill span {
  font-size: 8px;
}
.total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  padding: 14px 20px;
}
.total-label {
  font-size: 12px;
  opacity: 0.75;
}
.total-value {
  font-size: 34px;
  font-weight: 700;
  line-height: 1.15;
}
.total-sub {
  font-size: 12px;
  opacity: 0.7;
}
.content {
  margin-top: -44px;
  padding-bottom: 40px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 20px;
  align-items: start;
}
.main-col,
.side-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}
@media (max-width: 1024px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 760px) {
  .hero-inner {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 560px) {
  h1 {
    font-size: 24px;
  }
  .total {
    align-items: flex-start;
    width: 100%;
  }
}
</style>
