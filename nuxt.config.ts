// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    head: {
      link: [{
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css'
      }],
      script: [{
        src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js'
      }, {
        src: 'https://kit.fontawesome.com/4ae5eef027.js',
        crossorigin: 'anonymous'
      }]
    }
  },

  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/callback',
      exclude: ['/', '/api/auth/*', '/uscf/*', '/register']
    }
  },

  turnstile: {
    siteKey: '0x4AAAAAAAKsKEdr-d1daiqG'
  },

  eslint: {

  },

  modules: ['@nuxtjs/supabase', '@nuxtjs/turnstile', '@nuxtjs/eslint-module']
})
