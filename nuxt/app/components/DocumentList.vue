<script setup lang="ts">
import type { DocumentStatus, PilotDocument } from '~/types/api';

const store = useDashboardStore();

const LABEL: Record<DocumentStatus, string> = {
  expired: 'Expired',
  soon: 'Expiring soon',
  safe: 'Valid',
};

function remaining(doc: PilotDocument) {
  const n = Math.abs(doc.daysRemaining);
  if (doc.daysRemaining === 0) return 'Expires today';
  if (doc.daysRemaining < 0) return `Expired ${n} day${n === 1 ? '' : 's'} ago`;
  return `${n} day${n === 1 ? '' : 's'} left`;
}
</script>

<template>
  <section class="card" aria-labelledby="doc-title">
    <div class="card-head">
      <div>
        <h2 id="doc-title" class="card-title">Documents & Licences</h2>
        <p class="card-sub">
          As of {{ store.documents ? formatDate(store.documents.today) : '—' }}
          <template v-if="store.documents"> · warning at ≤ {{ store.documents.warningDays }} days</template>
        </p>
      </div>
    </div>

    <SectionState
      :loading="store.status.documents.loading && !store.documents"
      :error="store.status.documents.error"
      :height="300"
      @retry="store.loadDocuments()"
    />

    <template v-if="store.documents">
      <div class="summary">
        <span class="pill expired">{{ store.documents.summary.expired }} expired</span>
        <span class="pill soon">{{ store.documents.summary.soon }} expiring soon</span>
        <span class="pill safe">{{ store.documents.summary.safe }} valid</span>
      </div>

      <ul class="list">
        <li v-for="doc in store.documents.documents" :key="doc.id" class="item" :class="doc.status">
          <span class="dot" aria-hidden="true" />
          <div class="text">
            <p class="label">{{ doc.label.replace(/ Exp\. Date$| Date$/, '') }}</p>
            <p class="date">{{ formatDate(doc.expiryDate) }}</p>
          </div>
          <div class="right">
            <span class="pill" :class="doc.status">{{ LABEL[doc.status] }}</span>
            <span class="days">{{ remaining(doc) }}</span>
          </div>
        </li>
      </ul>
    </template>
  </section>
</template>

<style scoped>
.summary {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--border);
  border-left-width: 4px;
}
.item.expired {
  border-left-color: var(--bad);
  background: #fffafa;
}
.item.soon {
  border-left-color: #f59e0b;
  background: #fffdf5;
}
.item.safe {
  border-left-color: #10b981;
}
.dot {
  display: none;
}
.text {
  flex: 1;
  min-width: 0;
}
.label {
  font-weight: 600;
  font-size: 14px;
}
.date {
  font-size: 13px;
  color: var(--muted);
}
.right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.days {
  font-size: 12px;
  color: var(--muted);
}
</style>
