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
    discordPublicKey: process.env.DISCORD_PUBLIC_KEY,
    discordClientSecret: process.env.DISCORD_CLIENT_SECRET,

    public: {
      apiUrl: process.env.API_BASE_URL,
      lichessCodeChallenge: process.env.LICHESS_CODE_CHALLENGE,
      discordClientId: process.env.DISCORD_CLIENT_ID
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

  routeRules: {
    '/settings': { redirect: '/settings/profile' }
  },

  eslint: {

  },

  modules: ['@nuxtjs/supabase', '@nuxtjs/turnstile', '@nuxtjs/eslint-module', 'vuetify-nuxt-module', 'nuxt-simple-sitemap']
})
