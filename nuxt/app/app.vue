<template>
  <div class="app">
    <AppHeader />
    <NuxtPage />
    <footer class="footer">
      <div class="container foot">
        <SusiLogo light :height="24" />
        <span>© 2026 PT. ASI Pudjiastuti Aviation · Your Complete Air Transport Solution For All of Indonesia</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.footer {
  margin-top: auto;
  background: var(--navy);
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
}
.foot {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 20px;
  padding-bottom: 20px;
  flex-wrap: wrap;
}
</style>
