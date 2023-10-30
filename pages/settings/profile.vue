<template>
  <main>
    <h1>Profile Settings</h1>

    <v-alert v-if="status == 'success'" type="success" text="Your profile has been saved successfully!" class="mb-3" />
    <v-alert v-if="status == 'error'" type="error" text="An error occurred, please try again." class="mb-3" />
    <!-- Eventually replace these alerts with snackbars, reference pages/settings/integrations.vue#155 (https://github.com/Chew/ChessTools/blob/cc1c233d3a05c75ec8f2ab2f295ba6d090b6bf6b/pages/settings/integrations.vue#L155) -->

    <v-form @submit.prevent="submitForm">
      <v-row>
        <v-col cols="12" md="12">
          <v-text-field v-model="firstName" label="First name" required hide-details />
        </v-col>

        <v-col cols="12" md="12">
          <v-text-field v-model="lastName" label="Last name" required hide-details />
        </v-col>

        <v-col cols="12" md="12">
          <v-textarea v-model="bio" label="Bio" required hide-details />
        </v-col>

        <v-col cols="12" md="12">
          <v-btn type="submit" :block="true" class="mt-2" color="blue" :loading="status == 'submitting'">
            Submit
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useSupabaseClient } from '#imports'
import type { Database, TableUser } from '~/types/supabase'

export default defineComponent({
  name: 'profile',

  setup() {
    const user = useSupabaseUser().value
    const client = useSupabaseClient<Database>()

    if (!user) {
      throw showError('You are not signed in!')
    }

    return {
      user, client
    }
  },

  data() {
    return {
      firstName: '' as string,
      lastName: '' as string,
      bio: '',

      status: 'pending'
    }
  },

  beforeMount() {
    this.client.from('users').select('*').eq('id', this.user.id).single().then((data) => {
      const dbUser = data.data as TableUser

      if (!dbUser) {
        throw showError({ statusCode: 404, statusMessage: 'User Not Found' })
      }

      this.firstName = dbUser?.first_name || ''
      this.lastName = dbUser?.last_name || ''
      this.bio = dbUser?.bio || ''
    })
  },

  methods: {
    submitForm() {
      this.status = 'submitting'
      this.client.from('users').update({
        first_name: this.firstName,
        last_name: this.lastName,
        bio: this.bio
      }).eq('id', this.user.id).single().then((data) => {
        if (data.error) {
          this.status = 'error'
          throw showError({ statusCode: 500, statusMessage: data.error?.message })
        }

        this.status = 'success'
      })
    }
  }
})
</script>

<style scoped>

</style>
