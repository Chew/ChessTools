<template>
  <main>
    <h1>Integration Settings</h1>

    <p>Here is a list of all your integrations. You can integrate chess platforms and services to login with.</p>

    <h2>Chess Platform Integrations</h2>

    <p>Here you can manage your integrations with Chess sites and federations.</p>

    <v-alert type="info">
      Note: Chess sites can be authenticated and verified through OAuth.
      Federations require additional verification, but you are able to link it without verification.
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
          <td><verified-chip :verified="integrations.chesscom?.verified || false" /></td>
          <td>Link Coming Soon :)</td>
        </tr>

        <tr>
          <td>Lichess</td>
          <td v-if="integrations.lichess">
            Username: {{ integrations.lichess.data.username }}<br>
            ID: {{ integrations.lichess.data.id }}
          </td>
          <td v-else>
            Unlinked!
          </td>
          <td><verified-chip :verified="integrations.lichess?.verified || false" /></td>
          <td v-if="integrations.lichess">
            <unlink-integration-button integration="lichess" @success="handleUnlinked('lichess')" @failure="(e: string) => showFailure(e)" />
          </td>
          <td v-else>
            <page-link :href="buildLichessUrl()">
              <v-btn color="blue" :loading="linking.lichess">
                Link
              </v-btn>
            </page-link>
          </td>
        </tr>

        <!-- US Chess / USCF -->
        <tr>
          <td>US Chess</td>
          <td>{{ integrations.uscf?.data.id || "Unlinked" }}</td>
          <td v-if="integrations.uscf?.verified === false">
            <v-dialog width="500">
              <template #activator="{ props }">
                <verified-chip v-bind="props" :verified="false" />
              </template>

              <template #default="{ isActive }">
                <v-card title="Verify US Chess">
                  <v-card-text>
                    <v-alert type="info">
                      Note: If you have a FIDE ID linked to your US Chess profile, it will also be verified.
                    </v-alert>

                    Verifying your US Chess Account.

                    <v-list lines="one">
                      <v-list-item title="#1: Create a Forum Account">
                        Head on to <page-link href="https://uschess.discourse.group" text="the US Chess forums" /> and make an account.
                      </v-list-item>
                      <v-list-item title="#2: Start a DM with Chew">
                        Once you register, start a new DM with <page-link href="https://uschess.discourse.group/u/chew" text="@Chew" />.
                        Inside the DM, put your Chess.Tools username and indicate you're verifying your US Chess account.
                      </v-list-item>
                    </v-list>
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer />

                    <v-btn text="Okay" @click="isActive.value = false" />
                  </v-card-actions>
                </v-card>
              </template>
            </v-dialog>
          </td>
          <td v-else>
            <verified-chip :verified="integrations.uscf?.verified || false" />
          </td>
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
                  <v-btn color="blue-darken-1" variant="text" :disabled="uscfId === ''" :loading="linking.uscf" @click="linkPlatform('uscf', uscfId.toString())">
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

    <br>

    <h2>Misc Platforms</h2>

    <p>Link these platforms optionally for bonus stuff! Hover over the ? to see more.</p>

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
          <td>
            Discord
            <v-tooltip text="Used for the Chess.Tools Discord bot." location="top">
              <template #activator="{ props }">
                <i v-bind="props" class="fas fa-question-circle" />
              </template>
            </v-tooltip>
          </td>
          <td v-if="integrations.discord">
            Username: {{ integrations.discord.data.username }}<br>
            ID: {{ integrations.discord.data.id }}
          </td>
          <td v-else>
            Unlinked!
          </td>
          <td><verified-chip :verified="integrations.discord?.verified || false" /></td>
          <td v-if="integrations.discord">
            <unlink-integration-button integration="discord" @success="handleUnlinked('discord')" @failure="(e: string) => showFailure(e)" />
          </td>
          <td v-else>
            <page-link :href="buildDiscordUrl()">
              <v-btn color="blue" :loading="linking.discord">
                Link
              </v-btn>
            </page-link>
          </td>
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
import { defineComponent, type Ref } from 'vue'
import type { TableIntegrations } from '~/types/supabase'
import type { Integrations } from '~/types/integrations'
import { USCFPlayerSearchStates, type USCFPlayerSearchResult } from '~/types/uscf'
import type { USCFPlayerSearchResponse, UserIntegrationsResponse, UserLinkIntegrationResponse } from '~/types/requests'

export default defineComponent({
  name: 'Integrations',

  async setup() {
    useSeoMeta({
      title: 'Integration Settings'
    })

    const integrations: Ref<Record<Integrations, TableIntegrations | null>> = ref({} as Record<Integrations, TableIntegrations | null>)

    const user = useSupabaseUser().value
    if (user == null) {
      showError('You must be logged in to view this page.')
      return {
        uscfStates: [],
        integrations
      }
    }

    await $fetch<UserIntegrationsResponse>(`/api/users/${user.id}/integrations`)
      .then((data) => {
        if (!data) {
          showError('Unknown error')
        }

        if (!data.success) {
          // @ts-ignore error is just guaranteed to be a string here
          showError(data.error)
        }

        integrations.value = data.integrations
      })

    return {
      uscfStates: USCFPlayerSearchStates,
      integrations
    }
  },

  data() {
    return {
      success: false,
      message: '',

      // forms
      uscfLinkDialog: false,
      uscfId: '' as string | number,
      uscfName: '',
      uscfState: 'ANY',
      uscfResults: [] as USCFPlayerSearchResult[],
      uscfSearching: false,

      // state
      linking: {
        lichess: false,
        uscf: false,
        discord: false
      } as Record<string, boolean>,
      snackbar: false
    }
  },

  beforeMount() {
    const query = useRoute().query

    if (query.state === 'lichess-integration' && query.code) {
      const config = useRuntimeConfig()
      const lichessData = {
        code: query.code.toString(),
        redirectUri: config.public.apiUrl + '/settings/integrations'
      }

      this.linkPlatform('lichess', lichessData)
    } else if (query.state === 'discord-integration' && query.code) {
      const config = useRuntimeConfig()
      const discordData = {
        code: query.code.toString(),
        redirectUri: config.public.apiUrl + '/settings/integrations'
      }

      this.linkPlatform('discord', discordData)
    }
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

    linkPlatform(platform: Integrations, data: string | object) {
      this.linking[platform] = true
      $fetch<UserLinkIntegrationResponse>('/api/users/me/integrations/link', {
        headers: useRequestHeaders(['cookie']),
        method: 'POST',
        body: {
          platform,
          data
        }
      }).then((data) => {
        this.linking[platform] = false

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
        this.integrations[platform] = data.integration
      })
    },

    uscfSearch() {
      this.uscfSearching = true
      $fetch<USCFPlayerSearchResponse>('/api/uscf/player-search', {
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

      this.integrations[platform] = null
    },

    buildLichessUrl(): string {
      const config = useRuntimeConfig()
      const challenge = config.public.lichessCodeChallenge
      // redirect URI is the exact page url we are on RIGHT NOW
      const redirectUri = config.public.apiUrl + '/settings/integrations'

      return `https://lichess.org/oauth?response_type=code&client_id=chess.tools&redirect_uri=${redirectUri}&code_challenge_method=S256&code_challenge=${challenge}&state=lichess-integration`
    },

    buildDiscordUrl(): string {
      const config = useRuntimeConfig()
      const clientId = config.public.discordClientId
      const redirectUri = config.public.apiUrl + '/settings/integrations'

      return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify&state=discord-integration`
    }
  }
})
</script>

<style scoped>

</style>
