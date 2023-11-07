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

      <div class="mb-3">
        <v-text-field v-model="username" type="text" variant="solo-filled" label="Username" prepend-inner-icon="mdi-account-outline"
                      :rules="[rules.alphanumeric, rules.length]" />
      </div>
      <div class="mb-3">
        <v-text-field v-model="email" label="Email Address" variant="solo-filled" type="email" prepend-inner-icon="mdi-email-outline"
                      :rules="[rules.email]" />
      </div>
      <div class="mb-3">
        <v-text-field v-model="password" label="Password" variant="solo-filled" prepend-inner-icon="mdi-lock-outline" type="password" />
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
import validator from 'validator'
import isEmail from 'validator/lib/isEmail'
import isAlphanumeric = validator.isAlphanumeric;
import isLength = validator.isLength;
import type { RegisterResponse } from '~/types/requests'

export default defineComponent({
  name: 'Register',

  setup() {
    // page meta
    definePageMeta({
      layout: 'auth'
    })

    // seo meta
    useSeoMeta({
      title: 'Register',
      description: 'Register for Chess.Tools'
    })

    // validation rules
    const rules: Record<string, (value: string) => boolean | string> = {
      email: value => isEmail(value) || 'Invalid email',
      alphanumeric: value => isAlphanumeric(value) || 'Must be alphanumeric',
      length: value => isLength(value, { min: 4, max: 32 }) || 'Must be between 4 and 32 characters'
    }

    return {
      rules
    }
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

      $fetch<RegisterResponse>('/api/auth/register', {
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
</style>
