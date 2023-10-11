<template>
  <main>
    <h1>Profile Settings</h1>

    <v-alert v-if="status == 'success'" type="success" title="Form Notice" text="Saved successfully!" class="mb-3" />
    <v-alert v-if="status == 'error'" type="error" title="Form Notice" text="An error occurred. Please try again." class="mb-3" />

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
          <v-btn type="submit" :block="true" class="mt-2" color="blue">
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
import { Database, TableUser } from '~/types/supabase'

export default defineComponent({
  name: 'profile',

  data() {
    return {
      firstName: '' as string,
      lastName: '' as string,
      bio: '',

      status: 'pending'
    }
  },

  beforeMount() {
    const user = useSupabaseUser().value
    const client = useSupabaseClient<Database>()

    client.from('users').select('*').eq('id', user?.id).single().then((data) => {
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
      const user = useSupabaseUser().value
      const client = useSupabaseClient<Database>()

      this.status = 'submitting'
      client.from('users').update({
        first_name: this.firstName,
        last_name: this.lastName,
        bio: this.bio
      }).eq('id', user?.id).single().then((data) => {
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
