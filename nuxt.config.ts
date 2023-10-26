// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,

    timeline: {
      enabled: true
    }
  },

  runtimeConfig: {
    lichessCodeVerifier: process.env.LICHESS_CODE_VERIFIER,

    public: {
      apiUrl: process.env.API_BASE_URL,
      lichessCodeChallenge: process.env.LICHESS_CODE_CHALLENGE
    }
  },

  app: {
    head: {
      link: [],
      script: [{
        src: 'https://kit.fontawesome.com/4ae5eef027.js',
        crossorigin: 'anonymous'
      }]
    }
  },

  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/callback',
      exclude: ['/', '/api/*', '/uscf/*', '/register', '/game/*']
    }
  },

  turnstile: {
    siteKey: '0x4AAAAAAAKsKEdr-d1daiqG'
  },

  vuetify: {
    vuetifyOptions: {
      labComponents: 'VDataTable'
    }
  },

  routeRules: {
    '/settings': { redirect: '/settings/profile' }
  },

  eslint: {

  },

  modules: ['@nuxtjs/supabase', '@nuxtjs/turnstile', '@nuxtjs/eslint-module', 'vuetify-nuxt-module']
})
