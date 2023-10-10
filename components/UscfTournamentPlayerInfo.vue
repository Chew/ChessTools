<template>
  <div class="row mt-3">
    <div class="col-md-6">
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
    </div>
    <div class="col-md-6">
      <h6>Rounds</h6>

      <v-table theme="dark" density="comfortable">
        <thead>
          <tr>
            <th>Players</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="round in player.rounds" :key="round.roundNumber">
            <td v-if="round.color == 'B'">
              <span class="d-flex align-center">
                <span :class="['play-icon', 'white', friendlyResult(round.result).includes('Loss') ? 'winner' : '']" />
                {{ findMember(players, round.opponentPairNumber)?.name || 'Unpaired' }}
              </span>
              <span class="d-flex align-center">
                <span :class="['play-icon', 'black', friendlyResult(round.result).includes('Win') ? 'winner' : '']" />
                {{ player.name }}
              </span>
            </td>
            <td v-else>
              <span class="d-flex align-center">
                <span :class="['play-icon', 'white', friendlyResult(round.result).includes('Win') ? 'winner' : '']" />
                {{ player.name }}
              </span>
              <span class="d-flex align-center">
                <span :class="['play-icon', 'black', friendlyResult(round.result).includes('Loss') ? 'winner' : '']" />
                {{ findMember(players, round.opponentPairNumber)?.name || 'Unpaired' }}
              </span>
            </td>

            <td>
              <div class="d-flex align-center">
                <div style="width: 0.9rem">
                  {{ cleanResult(round)[0] }}<br>
                  {{ cleanResult(round)[1] }}
                </div>
                <div class="ml-2">
                  <v-tooltip :text="friendlyResult(round.result)">
                    <template #activator="{ props }">
                      <i v-if="friendlyResult(round.result).includes('Win')" v-bind="props" class="fa-solid fa-square-plus text-green-lighten-1" />
                      <i v-else-if="friendlyResult(round.result).includes('Loss')" v-bind="props" class="fa-solid fa-square-minus text-red-lighten-1" />
                      <i v-else v-bind="props" class="fa-solid fa-square text-gray-lighten-1" />
                    </template>
                  </v-tooltip>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </div>
</template>

<script lang="ts">
import { capitalize, defineComponent } from 'vue'
import type { PropType } from 'vue'
import { USCFTournamentSectionPlayer } from '~/types/uscf'

export default defineComponent({
  name: 'UscfTournamentPlayerInfo',

  props: {
    player: {
      type: Object as PropType<USCFTournamentSectionPlayer>,
      required: true
    },
    players: {
      type: Array as PropType<USCFTournamentSectionPlayer[]>,
      required: true
    }
  },

  methods: {
    findMember(players: USCFTournamentSectionPlayer[], id: number) {
      for (const player of players) {
        if (player.pairNumber === id) {
          return player
        }
      }

      return null
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

    capitalize
  }
})
</script>

<style scoped>
/*noinspection CssUnusedSymbol*/
.winner {
  border: 0.2rem solid #81b64c;
}

.white {
  background-color: #fff;
}

.black {
  background-color: #565352;
}

.play-icon {
  border-radius: 0.2rem;
  display: block;
  flex-shrink: 0;
  height: 1rem;
  margin-right: 0.5rem;
  width: 1rem;
}

.align-center {
  align-items: center;
}
</style>
