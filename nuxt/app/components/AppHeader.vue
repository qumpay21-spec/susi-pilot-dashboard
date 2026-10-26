<script setup lang="ts">
const store = useDashboardStore();
const initials = computed(() =>
  (store.pilot?.name ?? '')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
);
</script>

<template>
  <header class="header">
    <div class="container bar">
      <div class="brand">
        <SusiLogo :height="30" />
        <span class="divider" aria-hidden="true" />
        <span class="product">Pilot Portal</span>
      </div>
      <div v-if="store.pilot" class="user">
        <div class="user-text">
          <strong>{{ store.pilot.name }}</strong>
          <span>Pilot</span>
        </div>
        <span class="avatar" aria-hidden="true">{{ initials }}</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #fff;
  border-bottom: 1px solid var(--border);
  box-shadow: 0 2px 10px rgba(14, 20, 64, 0.05);
}
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}
.divider {
  width: 1px;
  height: 24px;
  background: var(--border);
}
.product {
  font-weight: 600;
  color: var(--navy);
  font-size: 14px;
  letter-spacing: 0.02em;
}
.user {
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-text {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.2;
}
.user-text strong {
  font-size: 14px;
  color: var(--navy);
}
.user-text span {
  font-size: 12px;
  color: var(--muted);
}
.avatar {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--navy);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}
@media (max-width: 560px) {
  .divider,
  .product,
  .user-text {
    display: none;
  }
}
</style>
