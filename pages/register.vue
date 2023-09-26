<template>
  <main class="form-signin w-100 m-auto">
    <form @submit.prevent="register">
      <h1 class="h3 mb-3 fw-normal">
        Register for Chess.Tools
      </h1>

      <p v-if="error" class="text-danger">
        <img src="https://cdn.discordapp.com/emojis/823648979194740746.webp?size=240&quality=lossless" alt="blunder icon" style="width: 20px;">
        {{ error }}
      </p>
      <p v-if="success" class="text-primary">
        <img src="https://cdn.discordapp.com/emojis/823649018616872971.webp?size=240&quality=lossless" alt="blunder icon" style="width: 20px;">
        {{ success }}
      </p>

      <div class="form-floating">
        <input id="floatingUsername" v-model="username" type="text" name="username" class="form-control">
        <label for="floatingUsername">Username</label>
      </div>
      <div class="form-floating">
        <input id="floatingInput" v-model="email" type="email" name="email" class="form-control">
        <label for="floatingInput">Email address</label>
      </div>
      <div class="form-floating">
        <input id="floatingPassword" v-model="password" type="password" name="password" class="form-control">
        <label for="floatingPassword">Password</label>
      </div>

      <div class="form-check text-start my-3">
        <input id="flexCheckDefault" class="form-check-input" type="checkbox" value="remember-me">
        <label class="form-check-label" for="flexCheckDefault">
          Remember Me
        </label>
      </div>

      <NuxtTurnstile v-model="token" />

      <button v-if="success" class="btn btn-secondary w-100 py-2" type="button" disabled>
        Registered!
      </button>
      <button v-else-if="signingUp" class="btn btn-secondary w-100 py-2" type="button" disabled>
        Signing Up...
      </button>
      <button v-else class="btn btn-primary w-100 py-2" type="submit">
        Sign Up
      </button>
      <p class="mt-5 mb-3 text-body-secondary">
        &copy; 2023–{{ new Date().getFullYear() }} Chess.Tools
      </p>
    </form>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useFetch } from '#app'

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
    async register() {
      this.signingUp = true

      const { data, error } = await useFetch<{ success: boolean, error: string }>('/api/auth/register', {
        method: 'POST',
        body: { username: this.username, email: this.email, password: this.password, token: this.token }
      })

      this.signingUp = false
      const dataValue = data.value

      if (dataValue == null || error) {
        this.error = error.value?.message || 'Unknown error'
        return
      }

      if (!dataValue.success) {
        this.error = dataValue.error
        return
      }

      // redirect to /login
      this.success = 'Your account has been created! Check your email for a code, then login.'
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
