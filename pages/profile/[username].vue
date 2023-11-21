<template>
  <main v-if="user">
    <h1>Profile for {{ user.username }}</h1>
    <p>{{ user.bio }}</p>

    <h2>Integrations</h2>
    <p>Coming Soon!</p>

    <h2>Recent Games</h2>
    <p>Coming Soon!</p>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { TableUser } from '~/types/supabase'
import type { UserResponse } from '~/types/requests'

export default defineComponent({
  name: '[username]',

  async setup() {
    const username = useRoute().params.username

    const supaUser = useSupabaseUser().value
    if (username === 'me') {
      if (!supaUser) {
        throw showError('You are not signed in!')
      }
    }

    let user: TableUser | null = null
    await $fetch<UserResponse>('/api/users/' + username, {
      headers: useRequestHeaders(['cookie'])
    }).then((data) => {
      if (data.error) {
        throw showError(data.error)
      }

      if (data.data === undefined) {
        throw showError('Error loading user data! Profile information is undefined :(')
      }

      if (!data.success) {
        throw showError({ statusCode: 404, message: 'User not found :(' })
      }

      user = data.data
    })

    if (user == null) {
      throw showError({ statusCode: 404, message: 'User not found :(' })
    }

    // set data for the page
    return {
      user: user as TableUser
    }
  }
})
</script>

<style scoped>

</style>
