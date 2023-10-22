<template>
  <main class="form-signin w-100 m-auto">
    <v-form @submit.prevent="login">
      <h1 class="h3 mb-3 fw-normal">
        Please sign in
      </h1>
      <p>
        Don't have an account?
        <NuxtLink to="/register">
          Create One!
        </NuxtLink>
      </p>

      <p v-if="invalidPassword" class="text-danger">
        <img src="https://cdn.discordapp.com/emojis/823648979194740746.webp?size=240&quality=lossless" alt="blunder icon" style="width: 20px;">
        Invalid email or password.
      </p>

      <div class="form-floating">
        <v-text-field v-model="email" label="Email Address" variant="outlined" type="email" />
      </div>
      <div class="form-floating">
        <v-text-field v-model="password" label="Password" variant="outlined" type="password" />
      </div>

      <div class="form-check text-start my-3">
        <input id="flexCheckDefault" class="form-check-input" type="checkbox" value="remember-me">
        <label class="form-check-label" for="flexCheckDefault">
          Remember me
        </label>
      </div>
      <v-btn color="blue" type="submit" :block="true">
        Sign in
      </v-btn>
      <p class="mt-5 mb-3 text-body-secondary">
        &copy; 2023–{{ new Date().getFullYear() }} Chess.Tools
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

    // const user = useSupabaseUser()

    // if (user) {
    //  navigateTo("/")
    // }
  },

  data() {
    return {
      email: '',
      password: '',
      invalidPassword: false
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

      const { error: loginError } = await supabase.auth.signInWithPassword(input)

      if (loginError) {
        if (loginError.message === 'Invalid login credentials') {
          this.invalidPassword = true
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
