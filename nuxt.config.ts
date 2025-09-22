// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Nuxt Hexagon Playground - Interactive Physics Simulation',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Interactive physics simulation with a bouncing ball inside a rotating hexagon. Built with Nuxt 4, Vue 3, and Canvas 2D.' },
        { name: 'theme-color', content: '#4f46e5' },
        { property: 'og:title', content: 'Nuxt Hexagon Playground' },
        { property: 'og:description', content: 'Interactive physics simulation with customizable parameters' },
        { property: 'og:type', content: 'website' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  }
})
