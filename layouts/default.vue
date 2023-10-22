<template>
  <v-app id="inspire">
    <v-app-bar flat>
      <v-container class="mx-auto d-flex align-center justify-center">
        <v-avatar class="me-4 " color="grey-darken-1" size="32" />

        <navbar-item name="Home" href="/" :current-path="useRoute().path" />

        <nav-dropdown name="Games" fa-icon="fas fa-chess">
          <nav-dropdown-item name="New Game" fa-icon="fas fa-plus" href="/game/new" />
        </nav-dropdown>

        <v-spacer />

        <v-responsive max-width="160" align="right">
          <nav-dropdown v-if="user" name="You">
            <nav-dropdown-item name="Profile" fa-icon="fas fa-user" href="/profile/me" />
            <v-divider />
            <nav-dropdown-item name="Settings" fa-icon="fas fa-cog" href="/settings/profile" />
            <nav-dropdown-item name="Logout" fa-icon="fas fa-sign-out-alt" @click="logout" />
          </nav-dropdown>
          <navbar-item v-else name="Login" href="/login" />
        </v-responsive>
      </v-container>
    </v-app-bar>

    <v-main class="bg-grey-lighten-3">
      <v-container>
        <v-row>
          <v-col v-if="useRoute().path.includes('settings')" cols="2">
            <v-sheet rounded="lg">
              <v-list rounded="lg">
                <v-list-item v-for="n in 5" :key="n" link :title="`List Item ${n}`" />

                <v-divider class="my-2" />

                <v-list-item color="grey-lighten-4" link title="Refresh" />
              </v-list>
            </v-sheet>
          </v-col>

          <v-col>
            <v-sheet min-height="70vh" rounded="lg" class="p-2">
              <slot />
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">

import NavbarItem from '~/components/NavbarItem.vue'
import { useSupabaseClient } from '#imports'

const links = [
  'Dashboard',
  'Messages',
  'Profile',
  'Updates'
]

const theme = useTheme()

function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

const user = useSupabaseUser().value

let isMobile = ref(false)
if (process.browser) {
  isMobile = ref(window.innerWidth < 768)

  // watch for window resize
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768
  })
}

async function logout() {
  await useSupabaseClient().auth.signOut()

  window.location.reload()
}
</script>

<!--suppress CssUnusedSymbol -->
<style>
.p-2 {
  padding: 0.5rem!important;
}

body {
  background-color: #b98761;
}

.v-application, .v-navigation-drawer {
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
