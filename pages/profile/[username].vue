<template>
  <main v-if="user">
    <h1>Profile for {{ user.username }}</h1>
    <p>{{ user.bio }}</p>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useFetch } from '#app'
import type { TableUser } from '~/types/supabase'
import type { UserResponse } from '~/types/requests'

export default defineComponent({
  name: '[username]',

  async setup() {
    const username = useRoute().params.username

    let user: TableUser | null = null
    await useFetch<UserResponse>('/api/users/' + username).then((res) => {
      const data = res.data.value
      const error = res.error.value

      if (error) {
        throw showError(error.message)
      }

      if (data == null || data.data === undefined) {
        throw showError('Error loading user data!')
      }

      if (data.success === false) {
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
