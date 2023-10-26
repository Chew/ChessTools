<template>
  <main>
    <h1>Integration Settings</h1>

    <p>Here you can manage your integrations with Chess sites and federations.</p>

    <v-alert type="info">
      Note: Chess sites can be authenticated and verified through OAuth.
      Federations can be verified through verifying your ID, but you are able to link it without verification.
      If your FIDE ID is linked to a federation, e.g. your USCF has a FIDE ID,
      you can link your FIDE ID to your USCF ID, and only verify your USCF ID.
    </v-alert>

    <br>

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
        <tr>
          <td>Chess.com</td>
          <td v-if="integrations.chesscom">
            Username: {{ integrations.chesscom.data.username }}<br>
            ID: {{ integrations.chesscom.data.id }}
          </td>
          <td v-else>
            Unlinked!
          </td>
          <td><verified-chip :verified="integrations.chesscom?.verified" /></td>
          <td>Link Coming Soon :)</td>
        </tr>

        <tr>
          <td>Lichess</td>
          <td>Unlinked!</td>
          <td><verified-chip :verified="false" /></td>
          <td>Link Coming Soon :)</td>
        </tr>

        <!-- US Chess / USCF -->
        <tr>
          <td>US Chess</td>
          <td>{{ integrations.uscf?.data.id || "Unlinked" }}</td>
          <td><verified-chip :verified="integrations.uscf?.verified" /></td>
          <td v-if="integrations.uscf">
            <unlink-integration-button integration="uscf" @success="handleUnlinked('uscf')" @failure="(e: string) => showFailure(e)" />
          </td>
          <td v-else>
            <v-dialog v-model="uscfLinkDialog" :persistent="true" width="1024">
              <template #activator="{ props }">
                <v-btn color="blue" v-bind="props">
                  Link
                </v-btn>
              </template>
              <v-card>
                <v-card-title>
                  <span class="text-h5">Link US Chess Account</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12">
                        <h2>Search by Name</h2>
                      </v-col>
                      <v-col cols="8">
                        <v-text-field v-model="uscfName" label="Name" />
                      </v-col>
                      <v-col cols="4">
                        <v-select v-model="uscfState" :items="uscfStates" item-title="name" item-value="abbr" label="State" />
                      </v-col>
                      <v-col cols="12">
                        <v-btn color="blue-darken-1" variant="tonal" :block="true" :loading="uscfSearching" @click="uscfSearch">
                          Search
                        </v-btn>
                      </v-col>
                      <v-col cols="12">
                        <v-table>
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>State</th>
                              <th>Member ID</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="result in uscfResults" :key="result.id">
                              <td>{{ result.name }}</td>
                              <td>{{ result.state }}</td>
                              <td>{{ result.id }}</td>
                              <td>
                                <v-btn color="blue-darken-1" variant="tonal" @click="uscfId = result.id">
                                  Select
                                </v-btn>
                              </td>
                            </tr>
                          </tbody>
                        </v-table>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12">
                        <h2>or, paste your member ID</h2>
                      </v-col>
                      <v-col cols="12">
                        <v-text-field v-model="uscfId" label="Member ID" />
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn color="blue-darken-1" variant="text" @click="uscfLinkDialog = false">
                    Close
                  </v-btn>
                  <v-btn color="blue-darken-1" variant="text" :disabled="uscfId === ''" :loading="uscfLinking" @click="linkUSCF">
                    Save
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </td>
        </tr>

        <tr>
          <td>FIDE</td>
          <td>Unlinked!</td>
          <td><verified-chip :verified="false" /></td>
          <td>Link Coming Soon :)</td>
        </tr>
      </tbody>
    </v-table>

    <v-snackbar v-model="snackbar" :timeout="2000" :color="success ? 'green' : 'red'">
      {{ message }}

      <template #actions>
        <v-btn color="blue-lighten-3" variant="text" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { TableIntegrations } from '~/types/supabase'
import { Integrations } from '~/types/integrations'
import { USCFPlayerSearchResult, USCFPlayerSearchStates } from '~/types/uscf'

export default defineComponent({
  name: 'Integrations',

  setup() {
    useSeoMeta({
      title: 'Integration Settings'
    })

    return {
      uscfStates: USCFPlayerSearchStates
    }
  },

  data() {
    return {
      success: false,
      message: '',
      integrations: {} as Record<Integrations, TableIntegrations | undefined>,

      // forms
      uscfLinkDialog: false,
      uscfId: '' as string | number,
      uscfName: '',
      uscfState: 'ANY',
      uscfResults: [] as USCFPlayerSearchResult[],
      uscfSearching: false,
      uscfLinking: false,

      // state
      snackbar: false
    }
  },

  beforeMount() {
    const user = useSupabaseUser().value
    if (!user) {
      showError('You must be logged in to view this page.')
      return
    }

    $fetch<{success: boolean, error: string, integrations: Record<Integrations, TableIntegrations>}>(`/api/users/${user.id}/integrations`)
      .then((data) => {
        if (!data) {
          this.showFailure('Unknown error')
          return
        }

        if (!data.success) {
          // @ts-ignore error is just guaranteed to be a string here
          this.showFailure(data.error)
          return
        }

        this.integrations = { ...data.integrations }
      })
  },

  methods: {
    showSuccess(message: string) {
      this.success = true
      this.snackbar = true
      this.message = message
    },

    showFailure(message: string) {
      this.success = false
      this.message = 'Failed: ' + message
      this.snackbar = true
    },

    linkUSCF() {
      this.uscfLinking = true
      $fetch<{success: boolean, error: string, integration: TableIntegrations}>('/api/users/me/integrations/link', {
        headers: useRequestHeaders(['cookie']),
        method: 'POST',
        body: {
          platform: 'uscf',
          data: this.uscfId
        }
      }).then((data) => {
        this.uscfLinking = false

        if (!data) {
          this.showFailure('Unknown error')
          return
        }

        if (!data.success) {
          // @ts-ignore error is just guaranteed to be a string here
          this.showFailure(data.error)
          return
        }

        this.showSuccess('Linked successfully!')
        this.uscfLinkDialog = false
        this.integrations.uscf = data.integration
      })
    },

    uscfSearch() {
      this.uscfSearching = true
      $fetch<{success: boolean, error: string | null, totalPlayers?: number, results?: USCFPlayerSearchResult[]}>('/api/uscf/player-search', {
        headers: useRequestHeaders(['cookie']),
        method: 'POST',
        body: {
          name: this.uscfName,
          state: this.uscfState
        }
      }).then((data) => {
        this.uscfSearching = false
        if (!data) {
          this.showFailure('Unknown error')
          return
        }

        if (!data.success || data.results === undefined) {
          // @ts-ignore error is just guaranteed to be a string here
          this.showFailure(data.error)
          return
        }

        this.uscfResults = data.results
      })
    },

    handleUnlinked(platform: Integrations) {
      this.showSuccess('Unlinked Successfully!')

      this.integrations[platform] = undefined
    }
  }
})
</script>

<style scoped>

</style>
