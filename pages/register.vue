<template>
  <main class="form-signin w-100 m-auto bg-grey-lighten-3">
    <v-form @submit.prevent="register">
      <h1 class="h3 mb-3 fw-normal">
        Register for Chess.Tools
      </h1>

      <v-alert v-if="error" type="error" class="mb-3">
        {{ error }}
      </v-alert>
      <v-alert v-if="success" type="success" class="mb-3">
        {{ success }}
      </v-alert>

      <div class="form-floating">
        <v-text-field v-model="username" type="text" name="username" variant="solo-filled" label="Username" />
      </div>
      <div class="form-floating">
        <v-text-field v-model="email" label="Email Address" variant="solo-filled" type="email" />
      </div>
      <div class="form-floating">
        <v-text-field v-model="password" label="Password" variant="solo-filled" type="password" />
      </div>

      <NuxtTurnstile v-model="token" />

      <v-btn v-if="success" color="grey" type="button" :disabled="true" :block="true">
        Registered!
      </v-btn>
      <v-btn v-else-if="signingUp" color="grey" type="button" :disabled="true" :block="true">
        <v-progress-circular indeterminate :size="15" :width="2" />&nbsp;Signing Up...
      </v-btn>
      <v-btn v-else color="blue" type="submit" :block="true">
        Sign Up
      </v-btn>
      <p class="mt-5 mb-3 text-body-secondary">
        &copy; 2023–{{ new Date().getFullYear() }} Chess.Tools
      </p>
    </v-form>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Register',

  setup() {
    definePageMeta({
      layout: 'auth'
    })
  },

  data() {
    return {
      username: '',
      email: '',
      password: '',
      token: '',
      signingUp: false,
      error: '',
      success: ''
    }
  },

  methods: {
    register() {
      this.signingUp = true

      $fetch<{ success: boolean, error: string }>('/api/auth/register', {
        method: 'POST',
        body: { username: this.username, email: this.email, password: this.password, token: this.token }
      }).then((res) => {
        this.signingUp = false

        if (!res.success) {
          this.error = res.error
          return
        }

        // redirect to /login
        this.success = 'Your account has been created! Check your email for a code, then login.'
      })
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

.form-signin input[name="username"] {
  margin-bottom: -1px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.form-signin input[name="email"] {
  margin-bottom: -1px;
  border-radius: 0;
}

.form-signin input[name="password"] {
  margin-bottom: 10px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

</style>
