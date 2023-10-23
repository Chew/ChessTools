<template>
  <main>
    <h1>Integration Settings</h1>

    <p>Here you can manage your integrations with Chess sites and federations.</p>

    <v-alert type="info">
      Note: Chess sites can be authenticated and verified through OAuth.
      Federations can be verified through verifying your ID, but you are able to link it without verification.
      If your FIDE ID is linked to a federation, e.g. your USCF has a FIDE ID, you can link your FIDE ID to your USCF ID, and only verify your USCF ID.
    </v-alert>

    <br>

    <p v-if="message" class="alert alert-danger">
      Error: {{ message }}
    </p>

    <v-table theme="dark">
      <thead>
        <tr>
          <th>Platform</th>
          <th>Username/ID</th>
          <th>Verified?</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="integrations.chesscom">
          <td>Chess.com</td>
          <td>{{ integrations.chesscom.data }}</td>
          <td>{{ integrations.chesscom.verified }}</td>
          <td>Unlink</td>
        </tr>
        <tr v-else>
          <td>Chess.com</td>
          <td>Unlinked!</td>
          <td>Unverified</td>
          <td>Link Coming Soon :)</td>
        </tr>

        <tr>
          <td>Lichess</td>
          <td>Unlinked!</td>
          <td>Unverified</td>
          <td>Link Coming Soon :)</td>
        </tr>

        <tr v-if="integrations.uscf">
          <td>US Chess</td>
          <td>{{ integrations.uscf.data.id }}</td>
          <td>{{ integrations.uscf.verified ? "Verified!" : "Unverified" }}</td>
          <td>
            <v-btn color="red">
              <i class="fas fa-link-slash" />&nbsp;Unlink
            </v-btn>
          </td>
        </tr>
        <tr v-else>
          <td>US Chess</td>
          <td>Unlinked!</td>
          <td>Unverified</td>
          <td>
            <form class="input-group" @submit.prevent="linkUSCF">
              <input v-model="uscfId" type="text" placeholder="USCF ID" class="form-control">
              <v-btn type="submit" class="btn btn-primary">
                Link
              </v-btn>
            </form>
          </td>
        </tr>

        <tr>
          <td>FIDE</td>
          <td>Unlinked!</td>
          <td>Unverified</td>
          <td>Link</td>
        </tr>
      </tbody>
    </v-table>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { TableIntegrations } from '~/types/supabase'

export default defineComponent({
  name: 'Integrations',

  data() {
    return {
      success: false,
      message: '',
      integrations: {} as Record<string, TableIntegrations>,

      // forms
      uscfId: ''
    }
  },

  beforeMount() {
    const user = useSupabaseUser().value
    if (!user) {
      return
    }

    $fetch<{success: boolean, error: string, integrations: Record<string, TableIntegrations>}>(`/api/users/${user.id}/integrations`)
      .then((data) => {
        if (!data) {
          this.message = 'Unknown error'
          return
        }

        if (!data.success) {
        // @ts-ignore error is just guaranteed to be a string here
          this.message = data.error
          return
        }

        this.integrations = { ...data.integrations }
      })
  },

  methods: {
    linkUSCF() {
      $fetch<{success: boolean, error: string, integration: TableIntegrations}>('/api/users/me/integrations/link', {
        headers: useRequestHeaders(['cookie']),
        method: 'POST',
        body: {
          platform: 'uscf',
          data: this.uscfId
        }
      }).then((data) => {
        if (!data) {
          this.message = 'Unknown error'
          return
        }

        if (!data.success) {
          // @ts-ignore error is just guaranteed to be a string here
          this.message = data.error
        }

        this.integrations.uscf = data.integration
      })
    }
  }
})
</script>

<style scoped>

</style>
