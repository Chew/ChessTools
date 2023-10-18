<template>
  <main>
    <h1>My Games</h1>

    <v-table theme="dark">
      <thead>
        <tr>
          <th>Players</th>
          <th>Result</th>
        </tr>
      </thead>
      <tbody>
        <chess-game-result-row v-for="game in cleanedGames" :key="game.id"
                               :white-player="game.whitePlayer" :black-player="game.blackPlayer"
                               :clean-result="game.cleanResult" :friendly-result="game.friendlyResult"
        />
      </tbody>
    </v-table>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Chess } from 'chess.js'
import { useSupabaseClient } from '#imports'
import { Database, TableGames } from '~/types/supabase'

export default defineComponent({
  name: 'games',

  async setup() {
    let games: TableGames[] = []
    await useSupabaseClient<Database>().from('games').select('*').eq('user_id', useSupabaseUser().value?.id).then((res) => {
      const data = res.data

      if (res.error) {
        console.error(res.error)
        return
      }

      if (data) {
        games = data
      }
    })

    // clean up the games and make them friendly for the table
    type game = {
      id: string,
      whitePlayer: {name: string, elo?: string|number},
      blackPlayer: {name: string, elo?: string|number},
      cleanResult: (number|string)[],
      friendlyResult: string,
    }

    const cleanedGames: game[] = []
    // iterate through games away
    for (const game of games) {
      const chess = new Chess()
      chess.loadPgn(game.pgn)
      const pgn = chess.header()

      const white = game.white_player || pgn.White
      const black = game.black_player || pgn.Black

      const result = pgn.Result.includes('-') ? pgn.Result.split('-') : [-1, -1]
      console.log(pgn.Result)
      let friendlyResult = 'Unknown'
      if (result[0] === '1') {
        friendlyResult = 'Win'
      } else if (result[0] === '0') {
        friendlyResult = 'Loss'
      } else if (result[0] === '½') {
        friendlyResult = 'Draw'
      }
      if (!pgn.Result.includes('-')) {
        friendlyResult = 'Unknown'
      }

      cleanedGames.push({
        id: game.id,
        whitePlayer: { name: white, elo: pgn.WhiteElo },
        blackPlayer: { name: black, elo: pgn.BlackElo },
        cleanResult: result,
        friendlyResult
      })
    }

    return {
      games, cleanedGames
    }
  }
})
</script>

<style scoped>

</style>
