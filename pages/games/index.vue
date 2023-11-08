<template>
  <main>
    <h1>My Games</h1>

    <v-table theme="dark">
      <thead>
        <tr>
          <th>Players</th>
          <th>Result</th>
          <th>Date</th>
          <th>View Game</th>
        </tr>
      </thead>
      <tbody>
        <chess-game-result-row v-for="game in games" :key="game.id" :link="`/game/${game.id}`"
                               :white-player="game.whitePlayer" :black-player="game.blackPlayer"
                               :clean-result="game.cleanResult" :friendly-result="game.friendlyResult"
                               :date="game.date"
        />
      </tbody>
    </v-table>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { CleanedGame } from '~/utils/games'
import type { GetGameResponse } from '~/types/requests'

export default defineComponent({
  name: 'index',

  async setup() {
    const user = useSupabaseUser().value
    if (!user) {
      throw showError({ statusCode: 500, statusMessage: 'Sign in??' })
    }

    useSeoMeta({
      title: 'My Games',
      description: 'View your games'
    })

    let games: CleanedGame[] = []
    await $fetch<GetGameResponse>('/api/games/:id'.replace(':id', user.id)).then((res) => {
      if (!res.success) {
        throw showError({ statusCode: 500, statusMessage: res.error ?? 'Unknown error' })
      }

      games = res.games ?? []
    })

    return {
      games
    }
  }
})
</script>

<style scoped>

</style>
