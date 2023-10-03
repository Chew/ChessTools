<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a href="/" class="navbar-brand">Chess Tools</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText"
                aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon" />
        </button>
        <div id="navbarText" class="collapse navbar-collapse">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <navbar-item name="Home" href="/" :current-path="useRoute().path" />
          </ul>

          <ul v-if="user" class="navbar-nav">
            <li class="navbar-item">
              <a class="nav-link" href="#" @click="logout">Log Out</a>
            </li>
          </ul>
          <ul v-else class="navbar-nav">
            <navbar-item name="Login" href="/login" current-path="/" />
          </ul>
        </div>
      </div>
    </nav>
    <div class="container move-container">
      <div class="p-4 bg-body-tertiary rounded-3">
        <v-app>
          <slot />
        </v-app>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NavbarItem from '~/components/NavbarItem.vue'
import { useSupabaseClient } from '#imports'

const user = useSupabaseUser()

async function logout() {
  await useSupabaseClient().auth.signOut()

  window.location.reload()
}
</script>

<style>
body {
  background-color: #b98761;
}

/*noinspection CssUnusedSymbol*/
.v-application {
  background: unset!important;
}
</style>
