<script setup lang="ts">
/** Shows a loading skeleton or an error with a retry button for one dashboard card. */
defineProps<{ loading: boolean; error: string | null; height?: number }>();
defineEmits<{ retry: [] }>();
</script>

<template>
  <div v-if="error" class="state error" role="alert">
    <p>Could not load this section.</p>
    <p class="detail">{{ error }}</p>
    <button type="button" class="retry" @click="$emit('retry')">Try again</button>
  </div>
  <div
    v-else-if="loading"
    class="state skeleton"
    :style="{ height: `${height ?? 220}px` }"
    aria-busy="true"
    aria-label="Loading"
  />
</template>

<style scoped>
.state {
  border-radius: 10px;
}
.error {
  padding: 20px;
  background: var(--bad-bg);
  color: var(--bad);
  text-align: center;
}
.detail {
  font-size: 13px;
  opacity: 0.8;
  margin: 4px 0 12px;
}
.retry {
  border: 0;
  background: var(--bad);
  color: #fff;
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 600;
}
.skeleton {
  background: linear-gradient(90deg, #eef1f7 25%, #f7f8fc 50%, #eef1f7 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}
</style>
