<template>
  <main>
    <h1>My Games</h1>

    <v-table theme="dark">
      <thead>
        <tr>
          <th>Players</th>
          <th>Result</th>
          <th>View Game</th>
        </tr>
      </thead>
      <tbody>
        <chess-game-result-row v-for="game in games" :key="game.id" :link="`/game/${game.id}`"
                               :white-player="game.whitePlayer" :black-player="game.blackPlayer"
                               :clean-result="game.cleanResult" :friendly-result="game.friendlyResult"
        />
      </tbody>
    </v-table>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { CleanedGame } from '~/utils/games'

export default defineComponent({
  name: 'games',

  async setup() {
    const user = useSupabaseUser().value
    if (!user) {
      throw showError({ statusCode: 500, statusMessage: 'Sign in??' })
    }

    let games: CleanedGame[] = []
    await $fetch<{success: boolean, message?: string, games?: CleanedGame[]}>('/api/games/:id'.replace(':id', user.id)).then((res) => {
      if (!res.success) {
        throw showError({ statusCode: 500, statusMessage: res.message ?? 'Unknown error' })
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
