<template>
  <main>
    <h1>Game Importer</h1>

    <h2>Select a Platform</h2>
    <p>
      Click a platform to load games from and import as desired.
      If you want to link an account, go to <page-link text="your integration settings" href="/settings/integrations" />.
    </p>
    <div>
      <!-- on hold until chess.com lets me use their oauth :( -->
      <!-- <v-btn v-if="integrations?.chesscom" class="mr-3" text="Chess.com" color="green" /> -->
      <v-btn v-if="integrations?.lichess" text="Lichess" color="grey" :loading="lichessFetching" @click="fetchLichessGames" />
    </div>

    <h2>Games</h2>
    <v-table theme="dark">
      <thead>
        <tr>
          <th>Players</th>
          <th>Result</th>
          <th>Date</th>
          <th>Options</th>
        </tr>
      </thead>
      <tbody>
        <chess-game-result-row v-for="game in lichessGames" :key="game.id" :date="game.date"
                               :white-player="game.whitePlayer" :black-player="game.blackPlayer"
                               :clean-result="game.cleanResult" :friendly-result="game.friendlyResult">
          <td>
            <span v-if="game.imported?.status === false">
              <v-btn color="green" :loading="loading[game.id]" @click="importGame(game, 'lichess')">
                Import&nbsp;<i class="fa-solid fa-download" />
              </v-btn>
            </span>

            <PageLink v-if="game.imported?.status === true" :href="`/game/${game.imported.id}`">
              <v-btn color="blue">
                View&nbsp;<i class="fa-solid fa-external-link" />
              </v-btn>
            </PageLink>
          </td>
        </chess-game-result-row>
      </tbody>
    </v-table>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { Database } from '~/types/supabase'
import type { CleanedGame } from '~/utils/games'
import type { UserImportGameResponse, UserIntegrationsResponse, UserLichessGames } from '~/types/requests'

type weirdMergedCleanedGame = CleanedGame & {imported?: {status: boolean, id?: string}}

export default defineComponent({
  name: 'import',

  async setup() {
    const client = useSupabaseClient<Database>()
    const user = useSupabaseUser().value
    const id = user?.id

    const inteData = await useFetch<UserIntegrationsResponse>(`/api/users/${id}/integrations`)

    const integrations = inteData.data.value?.integrations

    return {
      client, user, integrations
    }
  },

  data() {
    return {
      // Your data properties here
      lichessFetching: false,
      lichessGames: [] as weirdMergedCleanedGame[],
      loading: {} as Record<string, boolean>
    }
  },

  methods: {
    // Your methods here
    async fetchLichessGames() {
      this.lichessFetching = true
      await $fetch<UserLichessGames>('/api/users/me/games/lichess').then((res) => {
        if (res.error) {
          throw showError({ statusCode: 500, statusMessage: res.error })
        }

        if (res.data) {
          this.lichessGames = res.data
        }
      })
      this.lichessFetching = false
    },

    async importGame(game: weirdMergedCleanedGame, platform: string) {
      this.loading[game.id] = true
      await $fetch<UserImportGameResponse>('/api/users/me/games/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          platformId: game.id,
          platform,
          platformUsername: this.integrations?.lichess?.data.id
        }
      }).then((res) => {
        if (res.error) {
          throw showError({ statusCode: 500, statusMessage: res.error })
        }

        if (res.success) {
          this.lichessGames.find(g => g.id === game.id)!.imported = { status: true, id: res.id }
        }
      })
      this.loading[game.id] = false
    }
  }
})
</script>
