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
            <navbar-item name="Home" href="/" :current-path="useRoute().path" fa-icon="fas fa-home" />
            <nav-dropdown name="Games">
              <nav-dropdown-item name="New Game" href="/game/new" fa-icon="fas fa-plus" />
              <nav-dropdown-item v-if="user" name="My Games" href="/games" fa-icon="fas fa-chess" />
            </nav-dropdown>
          </ul>

          <ul v-if="user" class="navbar-nav">
            <nav-dropdown name="You">
              <nav-dropdown-item name="Profile" href="/profile/me" fa-icon="fas fa-user" />
              <nav-dropdown-item name="Settings" href="/settings" fa-icon="fas fa-cog" />
              <nav-dropdown-divider />
              <nav-dropdown-item name="Log Out" @click="logout" />
            </nav-dropdown>
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

<!--suppress CssUnusedSymbol -->
<style>
body {
  background-color: #b98761;
}

.v-application {
  background: unset!important;
}

.v-application__wrap {
  min-height: unset!important;
}

.nav-link {
  /*noinspection All*/
  color: var(--bs-nav-link-color)!important;
}

.nav-link.active {
  /*noinspection All*/
  color: var(--bs-navbar-active-color)!important;
}
</style>
