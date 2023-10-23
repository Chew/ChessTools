<template>
  <v-row>
    <v-col md="6">
      <h5>{{ player.name }}</h5>
      <p>
        US Chess ID: <NuxtLink :to="`/uscf/member/${player.memberId}`">
          {{ player.memberId }}
        </NuxtLink>
      </p>
      <p>Total Points: {{ player.totalPoints }}</p>

      <h6>Rating Changes</h6>
      <p>
        <span v-for="(rating, key) in player.ratings" :key="key">
          {{ capitalize(key) }}: {{ rating?.pre }} => {{ rating?.post }}<br>
        </span>
      </p>
    </v-col>
    <v-col md="6">
      <h6>Rounds</h6>

      <v-table theme="dark" density="comfortable">
        <thead>
          <tr>
            <th>Players</th>
            <th>Result</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          <ChessGameResultRow v-for="round in player.rounds" :key="round.roundNumber" :unknown-color="round.color === 'U'"
                              :white-player="findMember(players, round.color === 'W' ? player.pairNumber : round.opponentPairNumber)"
                              :black-player="findMember(players, round.color === 'W' ? round.opponentPairNumber : player.pairNumber)"
                              :clean-result="cleanResult(round)" :friendly-result="friendlyResult(round.result)"
                              :link="gameLink(player.pairNumber, round.opponentPairNumber)"
                              :link-note="linkNote(player.pairNumber, round.opponentPairNumber)"
          />
        </tbody>
      </v-table>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import { capitalize, defineComponent } from 'vue'
import { USCFTournamentSectionPlayer } from '~/types/uscf'
import ChessGameResultRow from '~/components/ChessGameResultRow.vue'
import { TableGames } from '~/types/supabase'

export default defineComponent({
  name: 'UscfTournamentPlayerInfo',
  components: { ChessGameResultRow },

  props: {
    player: {
      type: Object as PropType<USCFTournamentSectionPlayer>,
      required: true
    },
    players: {
      type: Array as PropType<USCFTournamentSectionPlayer[]>,
      required: true
    },
    games: {
      type: Array as PropType<TableGames[]>,
      required: true
    }
  },

  methods: {
    findMember(players: USCFTournamentSectionPlayer[], id: number) {
      for (const player of players) {
        if (player.pairNumber === id) {
          let elo = 100
          if (player.ratings) {
            for (const key in (player.ratings as object)) {
              const value = (player.ratings as Record<string, {pre?: number, post: number}>)[key]
              const preValue = (value.pre || 0)
              if (preValue > elo) {
                elo = preValue
              }
            }
          }

          return { id: null, name: player.name, elo }
        }
      }

      return { id: null, name: 'Unpaired' }
    },

    cleanResult(round: USCFTournamentSectionPlayer['rounds'][0]) {
      // returns an array of [white score, black score], e.g. [1, 0] if white won, [0.5, 0.5] if draw, etc.
      if (round.result === 'W' || round.result === 'X') {
        return round.color === 'W' ? [1, 0] : [0, 1]
      } else if (round.result === 'L' || round.result === 'F') {
        return round.color === 'B' ? [1, 0] : [0, 1]
      } else if (round.result === 'D' || round.result === 'Z') {
        return ['½', '½']
      } else if (round.result === 'B') {
        return [1, 0]
      } else if (round.result === 'H') {
        return ['½', 0]
      } else {
        return [0, 0]
      }
    },

    friendlyResult(result: string) {
      switch (result) {
        case 'W':
          return 'Win'
        case 'L':
          return 'Loss'
        case 'B':
          return 'Full Point Bye (Win)'
        case 'H':
          return 'Half Point Bye (Draw)'
        case 'D':
          return 'Draw'
        case 'X':
          return 'Forfeit Win'
        case 'F':
          return 'Forfeit Loss'
        case 'U':
          return 'Unpaired'
        default:
          return 'Unknown'
      }
    },

    gameLink(playerId: number, opponentId: number): string | null {
      for (const game of this.games) {
        if (game.tournament_info?.player === playerId && game.tournament_info?.opponent === opponentId) {
          return `/game/${game.id}`
        } else if (game.tournament_info?.player === opponentId && game.tournament_info?.opponent === playerId) {
          return `/game/${game.id}`
        }
      }

      return null
    },

    linkNote(playerId: number, opponentId: number) {
      for (const game of this.games) {
        if (game.tournament_info?.player === playerId && game.tournament_info?.opponent === opponentId) {
          return undefined
        }
      }

      for (const game of this.games) {
        if (game.tournament_info?.player === opponentId && game.tournament_info?.opponent === playerId) {
          return "This will view the opponent's upload of the game, as this player has not uploaded their own version."
        }
      }

      return undefined
    },

    capitalize
  }
})
</script>

<style scoped>
</style>
