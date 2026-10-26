// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },

  // The dashboard is a client-side app that talks to the NestJS API,
  // so it can be deployed as a static site (`npm run generate`).
  ssr: false,

  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      // Override with NUXT_PUBLIC_API_BASE at build time, e.g. https://api.example.com/api
      apiBase: 'http://localhost:3001/api',
    },
  },

  app: {
    head: {
      title: 'Susi Air · Pilot Portal',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Susi Air pilot dashboard: duty roster, document validity and flight-time limits.' },
        { name: 'theme-color', content: '#1B2559' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
});
