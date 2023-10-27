<template>
  <main class="form-signin w-100 m-auto bg-grey-lighten-3">
    <v-form @submit.prevent="login">
      <h1 class="h3 mb-3 fw-normal align-items-center d-flex">
        Sign In
      </h1>
      <p class="mb-3">
        Don't have an account?
        <PageLink href="/register">
          Create One!
        </PageLink>
      </p>

      <v-alert v-if="invalidPassword" type="error" class="mb-3">
        Invalid email or password.
      </v-alert>

      <div class="form-floating">
        <v-text-field v-model="email" label="Email Address" variant="solo-filled" type="email" />
      </div>
      <div class="form-floating">
        <v-text-field v-model="password" label="Password" variant="solo-filled" type="password" />
      </div>

      <v-btn color="blue" type="submit" :block="true" :loading="signingIn">
        Sign in
      </v-btn>
      <p class="mt-5 mb-3 text-grey">
        &copy; 2023-{{ new Date().getFullYear() }} Chess.Tools
      </p>
    </v-form>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useSupabaseClient } from '#imports'

export default defineComponent({
  name: 'Login',

  setup() {
    definePageMeta({
      layout: 'auth'
    })

    useSeoMeta({
      title: 'Login to Chess.Tools',
      ogTitle: 'Login to Chess.Tools'
    })
  },

  data() {
    return {
      email: '',
      password: '',
      invalidPassword: false,
      signingIn: false
    }
  },

  watch: {
    // if email or password changes, hide the invalid password message
    email() {
      this.invalidPassword = false
    },
    password() {
      this.invalidPassword = false
    }
  },

  methods: {
    async login() {
      const supabase = useSupabaseClient()

      const input = {
        email: this.email.toString(),
        password: this.password.toString()
      }

      this.signingIn = true
      const { error: loginError } = await supabase.auth.signInWithPassword(input)
      this.signingIn = false

      if (loginError) {
        if (loginError.message === 'Invalid login credentials') {
          this.invalidPassword = true
          return
        }
      }

      navigateTo('/')
    }
  }
})
</script>

<style scoped>
html, body {
  height: 100%;
}

.form-signin {
  max-width: 330px;
  padding: 1rem;
}

.form-signin .form-floating:focus-within {
  z-index: 2;
}

.form-signin input[type="email"] {
  margin-bottom: -1px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.form-signin input[type="password"] {
  margin-bottom: 10px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

</style>
