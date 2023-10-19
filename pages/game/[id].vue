<template>
  <div class="row" autofocus tabindex="-1" @keydown.prevent="keyDown">
    <div class="col-md-8">
      <div class="mb-3">
        <v-btn color="blue" class="mr-1" @click="handleToggleOrientation">
          Toggle Orientation
        </v-btn>
        <v-btn color="green" class="mr-1" @click="switchMove(true)">
          Previous Move
        </v-btn>
        <v-btn color="green" class="mr-1" @click="switchMove(false)">
          Next Move
        </v-btn>
        <v-dialog v-if="userId === game?.user_id" v-model="dialog" :persistent="true" width="1024">
          <template #activator="{ props }">
            <v-btn color="primary" v-bind="props">
              Edit Details
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">Edit Game Details</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="8" sm="8" md="8">
                    <v-text-field v-model="white" label="White Player" />
                  </v-col>
                  <v-col cols="4" sm="4" md="4">
                    <v-text-field v-model="whiteElo" label="Elo" />
                  </v-col>
                  <v-col cols="8" sm="8" md="8">
                    <v-text-field v-model="black" label="Black Player" />
                  </v-col>
                  <v-col cols="4" sm="4" md="4">
                    <v-text-field v-model="blackElo" label="Elo" />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-select v-model="result" :items="results()" :item-props="resultProps" label="Result" />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" sm="12" md="12">
                    <v-text-field v-model="event" label="Event" />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" sm="12" md="12">
                    <v-text-field v-model="timeControl" label="Time Control" />
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn color="blue-darken-1" variant="text" @click="dialog = false">
                Close
              </v-btn>
              <v-btn color="blue-darken-1" variant="text" @click="savePGN">
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>

      <p v-if="game?.tournament_info">
        This game was from a tournament!
        <NuxtLink :to="`/uscf/tournament/${game?.tournament_info.eventId}`">
          Click to view it.
        </NuxtLink>
      </p>

      <div class="row g-3 align-items-center mb-3">
        <div class="col-auto">
          <label for="topPlayer" class="col-form-label">{{ whiteOnBottom ? 'Black' : 'White' }} Player</label>
        </div>
        <div class="col-auto">
          <input v-if="whiteOnBottom" id="topPlayer" v-model="black" type="text" class="form-control" readonly>
          <input v-else id="topPlayer" v-model="white" type="text" class="form-control" readonly>
        </div>
      </div>

      <the-chessboard
        :board-config="boardConfig"
        @board-created="(api) => handleBoardCreated(api)"
        @move="handleMove"
      />

      <div class="row g-3 align-items-center mt-3">
        <div class="col-auto">
          <label for="bottomPlayer" class="col-form-label">{{ whiteOnBottom ? 'White' : 'Black' }} Player</label>
        </div>
        <div class="col-auto">
          <input v-if="whiteOnBottom" id="bottomPlayer" v-model="white" type="text" class="form-control" readonly>
          <input v-else id="bottomPlayer" v-model="black" type="text" class="form-control" readonly>
        </div>
      </div>
    </div>
    <div class="col-md-4">
      <h2>Moves</h2>

      <p v-if="opening">
        Opening: {{ opening }}
      </p>

      <div class="mb-3">
        <a href="#" class="btn btn-primary" @click="downloadPGN">Download PGN</a>
      </div>

      <v-table theme="dark" density="compact" height="610px">
        <thead>
          <tr>
            <th>Move #</th>
            <th>White</th>
            <th>Black</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(move, i) in history" :key="i">
            <td>{{ i + 1 }}</td>
            <td v-if="move[0]" :class="index == ((i + 1) * 2) - 1 ? `text-bg-info` : ''">
              <a href="#" :class="['text-decoration-none', index == ((i + 1) * 2) - 1 ? 'text-grey-lighten-3' : 'text-grey']"
                 @click.prevent="historyAt(((i + 1) * 2) - 1)">{{ move[0].san }}
              </a>
            </td>
            <td v-if="move[1]" :class="index == ((i + 1) * 2) ? `text-bg-info` : ''">
              <a href="#" :class="['text-decoration-none', index == ((i + 1) * 2) ? 'text-grey-lighten-3' : 'text-grey']"
                 @click.prevent="historyAt((i + 1) * 2)">{{ move[1].san }}</a>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { BoardApi, BoardConfig, TheChessboard } from 'vue3-chessboard'
import 'vue3-chessboard/style.css'
import type { Move } from 'chess.js'
import { useSupabaseClient } from '#imports'
import { Database, TableGames } from '~/types/supabase'
import { resultProps, results } from '~/utils/pgn'

export default defineComponent({
  name: '[id]',

  components: {
    TheChessboard
  },

  setup() {
    const user = useSupabaseUser().value

    return {
      userId: user?.id
    }
  },

  data() {
    return {
      boardAPI: null as BoardApi | null,
      boardConfig: {
        coordinates: true,
        viewOnly: false
      } as BoardConfig,
      history: [[]] as Move[][],
      game: null as TableGames | null,
      index: 0,
      opening: '' as string | null,
      whiteOnBottom: true,
      dialog: false,

      // PGN Info
      black: 'Player',
      blackElo: null as string | null,
      white: 'Player',
      whiteElo: null as string | null,
      event: '',
      timeControl: '',
      result: '*'
    }
  },

  beforeMount() {
    const route = useRoute()
    const id = route.params.id

    useSupabaseClient<Database>().from('games').select('*').eq('id', id).then((res) => {
      const data = res.data
      if (!data) {
        // throw 404
        throw showError({ statusCode: 500, statusMessage: 'Error fetching game! DATA IS GONE??' })
      }

      if (data.length === 0) {
        // throw 404
        throw showError({ statusCode: 404, statusMessage: 'Game Not Found' })
      }

      this.game = data[0]

      if (this.game == null) {
        throw showError({ statusCode: 404, statusMessage: 'Game Not Found' })
      }

      this.boardAPI?.loadPgn(this.game.pgn)
      this.createHistory()
      this.boardAPI?.getOpeningName().then((data) => {
        this.opening = data
      })

      const pgn = this.boardAPI?.getPgnInfo()
      if (!pgn) {
        return
      }

      if (pgn.White) {
        this.white = pgn.White
      }
      if (pgn.Black) {
        this.black = pgn.Black
      }
      if (pgn.WhiteElo) {
        this.whiteElo = pgn.WhiteElo
      }
      if (pgn.BlackElo) {
        this.blackElo = pgn.BlackElo
      }
      if (pgn.Event) {
        this.event = pgn.Event
      }
      if (pgn.TimeControl) {
        this.timeControl = pgn.TimeControl
      }
      if (pgn.Result) {
        this.result = pgn.Result
      }
    })
  },

  methods: {
    handleToggleOrientation() {
      this.boardAPI?.toggleOrientation()
      this.whiteOnBottom = !this.whiteOnBottom
    },

    async handleMove(move: Move) {
      if (move.san.includes('#') || move.san.includes('+')) {
        const audio = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-check.mp3')
        await audio.play()
      } else if (move.san.includes('O-O')) {
        const audio = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/castle.mp3')
        await audio.play()
      } else if (move.san.includes('x')) {
        const audio = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3')
        await audio.play()
      } else if (move.san.includes('=')) {
        const audio = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/promote.mp3')
        await audio.play()
      } else {
        const audio = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3')
        await audio.play()
      }
    },

    addToHistory(move: Move) {
      const currentMove = this.history[this.history.length - 1]
      if (currentMove.length === 2) {
        this.history.push([move])
      } else {
        currentMove.push(move)
      }
    },

    createHistory() {
      this.history = [[]]
      const history = this.boardAPI?.getHistory(true)
      if (!history) {
        return
      }

      for (const move of history) {
        this.addToHistory(move)
        this.index += 1
      }
    },

    handleBoardCreated(api: BoardApi) {
      this.boardAPI = api
    },

    downloadPGN() {
      const pgn = this.boardAPI?.getPgn()
      if (!pgn) {
        return
      }
      const element = document.createElement('a')
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(pgn))
      element.setAttribute('download', 'game.pgn')
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    },

    switchMove(previous: boolean = false) {
      if (previous) {
        this.index -= 1
        this.boardAPI?.viewHistory(this.index)
      } else {
        this.index += 1
        this.boardAPI?.viewHistory(this.index)
      }

      const move = this.boardAPI?.getHistory(true)[previous ? this.index - 1 : this.index - 1]
      if (!move) {
        return
      }
      this.handleMove(move)
    },

    historyAt(index: number) {
      this.index = index
      this.boardAPI?.viewHistory(this.index)

      const move = this.boardAPI?.getHistory(true)[this.index - 1]
      if (!move) {
        return
      }
      this.handleMove(move)
    },

    keyDown(event: KeyboardEvent) {
      switch (event.key) {
        case 'ArrowLeft':
          this.switchMove(true)
          break
        case 'ArrowRight':
          this.switchMove(false)
          break
      }
    },

    async savePGN() {
      const data: Record<string, string> = {
        White: this.white,
        Black: this.black,
        Result: this.result
      }

      if (this.whiteElo) {
        data.WhiteElo = this.whiteElo.toString()
      }
      if (this.blackElo) {
        data.BlackElo = this.blackElo.toString()
      }
      if (this.event) {
        data.Event = this.event
      }
      if (this.timeControl) {
        data.TimeControl = this.timeControl
      }

      this.boardAPI?.setPgnInfo(data)

      const { data: supaData, error } = await useSupabaseClient<Database>().from('games').update({
        pgn: this.boardAPI?.getPgn()
      }).eq('id', this.game?.id).select()

      if (error) {
        console.error(error)
      }

      if (supaData) {
        this.dialog = false
      }
    },

    // Util imports
    resultProps,
    results() {
      return results
    }
  }
})
</script>

<style scoped>
/*noinspection CssUnusedSymbol*/
.main-wrap {
  width: unset!important
}
</style>
