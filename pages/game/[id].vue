<template>
  <div class="row" autofocus tabindex="-1" @keydown.prevent="keyDown">
    <div class="col-md-8">
      <div class="mb-3">
        <v-btn color="blue" class="mr-1" @click="boardAPI?.toggleOrientation()">
          Toggle Orientation
        </v-btn>
        <v-btn color="green" class="mr-1" @click="switchMove(true)">
          Previous Move
        </v-btn>
        <v-btn color="green" class="mr-1" @click="switchMove(false)">
          Next Move
        </v-btn>
      </div>
      <the-chessboard
        :board-config="boardConfig"
        @board-created="(api) => handleBoardCreated(api)"
        @move="handleMove"
      />
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

// eslint-disable-next-line import/named
import { Move } from 'chess.js'
import { useSupabaseClient } from '#imports'
import { Database, TableGames } from '~/types/supabase'

export default defineComponent({
  name: '[id]',

  components: {
    TheChessboard
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
      opening: '' as string | null
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
    })
  },

  methods: {
    async handleMove(move: Move) {
      if (move.san.includes('#')) {
        const audio = new Audio('https://www.chess.com/sounds/_MP3_/default/game-end.mp3')
        await audio.play()
      } else if (move.san.includes('+')) {
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
