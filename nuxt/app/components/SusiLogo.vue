<script setup lang="ts">
/**
 * Susi Air wordmark. Uses the official logo when /logo-susiair.png exists in /public,
 * otherwise falls back to a vector recreation in the brand colours.
 */
const props = withDefaults(defineProps<{ light?: boolean; height?: number }>(), { light: false, height: 30 });
// The official logo has navy lettering, so on dark backgrounds (light = true)
// the white vector version is used instead.
const useImage = ref(!props.light);
// Bound at runtime so the build does not fail when the file is not there yet.
const logoSrc = '/logo-susiair.png';
</script>

<template>
  <img
    v-if="useImage"
    :src="logoSrc"
    alt="Susi Air"
    :style="{ height: `${height}px` }"
    class="logo-img"
    @error="useImage = false"
  />
  <svg
    v-else
    :height="height"
    viewBox="0 0 150 40"
    role="img"
    aria-label="Susi Air"
    class="logo-svg"
  >
    <!-- crown over the "i" -->
    <path
      d="M71 7 l2 -5 l2.2 3.4 l2.3 -4.4 l2.3 4.4 l2.2 -3.4 l2 5 z"
      :fill="light ? '#ffffff' : '#2B2A7E'"
    />
    <text
      x="2"
      y="33"
      font-family="Georgia, 'Times New Roman', serif"
      font-weight="700"
      font-size="34"
      :fill="light ? '#ffffff' : '#2B2A7E'"
      letter-spacing="-0.5"
    >Susi</text>
    <text
      x="84"
      y="34"
      font-family="'Brush Script MT', 'Segoe Script', Georgia, serif"
      font-style="italic"
      font-size="30"
      fill="#E0313F"
    >Air</text>
  </svg>
</template>

<style scoped>
.logo-img,
.logo-svg {
  display: block;
  width: auto;
}
</style>
