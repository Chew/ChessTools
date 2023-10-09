<template>
  <div class="row">
    <div class="col-md-8">
      <div class="mb-3">
        <v-btn color="blue" class="mr-1" @click="handleOrientation">
          Switch Sides
        </v-btn>
        <v-btn color="red" class="mr-1" @click="handleReset">
          Reset
        </v-btn>
        <v-btn color="orange" class="mr-1" @click="handleUndo">
          Undo
        </v-btn>
        <v-btn color="yellow" class="mr-1" @click="boardAPI?.toggleMoves()">
          Possible Moves
        </v-btn>
        <v-btn color="green" class="mr-1" @click="randomMove">
          Random Move
        </v-btn>
      </div>
      <div class="row g-3 align-items-center mb-3">
        <div class="col-auto">
          <label for="inputPassword6" class="col-form-label">{{ whiteOnBottom ? 'Black' : 'White' }} Player</label>
        </div>
        <div class="col-auto">
          <input v-if="whiteOnBottom" v-model="black" type="text" class="form-control" aria-describedby="passwordHelpInline">
          <input v-else v-model="white" type="text" class="form-control" aria-describedby="passwordHelpInline">
        </div>
      </div>
      <the-chessboard
        :board-config="boardConfig"
        @board-created="(api) => (boardAPI = api)"
        @check="handleCheck"
        @move="handleMove"
        @checkmate="handleCheckmate"
      />

      <div class="row g-3 align-items-center mt-3">
        <div class="col-auto">
          <label for="inputPassword6" class="col-form-label">{{ whiteOnBottom ? 'White' : 'Black' }} Player</label>
        </div>
        <div class="col-auto">
          <input v-if="whiteOnBottom" v-model="white" type="text" class="form-control" aria-describedby="passwordHelpInline">
          <input v-else v-model="black" type="text" class="form-control" aria-describedby="passwordHelpInline">
        </div>
      </div>
    </div>
    <div class="col-md-4">
      <h2>Moves</h2>

      <div class="mb-3">
        <a href="#" class="btn btn-primary mr-3" @click="downloadPGN">Download PGN</a>
        <a v-if="useSupabaseUser() && saveToProfileStatus === 'pending'" href="#" class="btn btn-primary" @click.prevent="saveToProfile">
          Save to Profile
        </a>
        <button v-else-if="saveToProfileStatus === 'sending'" class="btn btn-secondary" disabled>
          <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
          Saving...
        </button>
        <button v-else-if="saveToProfileStatus === 'success'" class="btn btn-success" disabled>
          <i class="fas fa-check" /> Saved!
        </button>
        <button v-else class="btn btn-danger" disabled>
          <!-- failure -->
          <i class="fas fa-times" /> {{ saveToProfileStatus }}
        </button>
      </div>

      <v-table theme="dark" density="compact" height="650px">
        <thead>
          <tr>
            <th>Move #</th>
            <th>White</th>
            <th>Black</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(move, index) in history" :key="index">
            <td>{{ index + 1 }}</td>
            <td v-if="move[0]">
              {{ move[0].san }}
            </td>
            <td v-if="move[1]">
              {{ move[1].san }}
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { BoardApi, Promotion, TheChessboard } from 'vue3-chessboard'
import 'vue3-chessboard/style.css'

// eslint-disable-next-line import/named
import { Move } from 'chess.js'

export default defineComponent({
  name: '[id]',

  components: {
    TheChessboard
  },

  setup() {
    useSeoMeta({
      title: 'Game Scorecard',
      description: 'Create a game of chess, with no distractions, no analysis, mobile friendly, and undo. Download as a PGN when you are done.'
    })
  },

  data() {
    return {
      boardAPI: null as BoardApi | null,
      boardConfig: {
        coordinates: true
      },
      history: [[]] as Move[][],

      saveToProfileStatus: 'pending',
      black: 'Player',
      white: 'Player',
      whiteOnBottom: true
    }
  },

  methods: {
    handleCheck() {
      const audio = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-check.mp3')
      audio.play()
    },

    handleCheckmate() {
      // play audio from https://www.chess.com/sounds/_MP3_/default/game-end.mp3
      const audio = new Audio('https://www.chess.com/sounds/_MP3_/default/game-end.mp3')
      audio.play()
    },

    async handleMove(move: Move) {
      this.addToHistory(move)

      if (move.san.includes('O-O')) {
        const audio = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/castle.mp3')
        await audio.play()
      } else if (move.san.includes('x')) {
        const audio = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3')
        await audio.play()
      } else if (move.san.includes('=')) {
        const audio = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/promote.mp3')
        await audio.play()
      } else if (!move.san.includes('#') && !move.san.includes('+')) {
        const audio = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3')
        await audio.play()
      }
    },

    randomMove() {
      const moves = this.boardAPI?.getPossibleMoves()

      if (moves) {
        const randomPiece = Math.floor(Math.random() * moves.size)
        const piece = moves.get(Array.from(moves.keys())[randomPiece])
        if (!piece) {
          return
        }
        const randomPosition = Math.floor(Math.random() * piece.length)
        const position = piece[randomPosition]
        if (!position) {
          return
        }

        const from = Array.from(moves.keys())[randomPiece]

        let promotion
        if (this.boardAPI?.getSquare(from !== 'a0' ? from : 'a1')?.type === 'p' && (position.split('')[1] === '8' || position.split('')[1] === '1')) {
          // random promotion
          const possiblePromotions = ['q', 'r', 'b', 'n']
          const randomPromotion = Math.floor(Math.random() * possiblePromotions.length)
          promotion = possiblePromotions[randomPromotion] as Promotion
        }

        let data
        if (promotion) {
          data = { from, to: position, promotion }
        } else {
          data = { from, to: position }
        }

        this.boardAPI?.move(data)

        // TODO: Add way to add PGN info. https://github.com/qwerty084/vue3-chessboard/pull/224
        // this.boardAPI?.setPgnInfo({ Event: 'Test' })
      }
    },

    addToHistory(move: Move) {
      const currentMove = this.history[this.history.length - 1]
      if (currentMove.length === 2) {
        this.history.push([move])
      } else {
        currentMove.push(move)
      }

      this.saveToProfileStatus = 'pending'
    },

    handleOrientation() {
      this.boardAPI?.toggleOrientation()
      this.whiteOnBottom = !this.whiteOnBottom
    },

    handleUndo() {
      this.boardAPI?.undoLastMove()
      this.history[this.history.length - 1].pop()
      if (this.history.length > 1 && this.history[this.history.length - 1].length === 0) {
        this.history.pop()
      }
    },

    handleReset() {
      this.boardAPI?.resetBoard()
      this.history = [[]]
    },

    saveToProfile() {
      this.saveToProfileStatus = 'sending'

      // TODO: Customize this :)
      const pgn = this.boardAPI?.getPgn()
      const data = [
         `[White "${this.white}"]`,
         `[Black "${this.black}"]`,
         '[Result "*"]'
      ]

      $fetch<{success: boolean, message: string}>('/api/games/save', {
        headers: useRequestHeaders(['cookie']),
        method: 'POST',
        body: {
          pgn: data.join('\n') + '\n' + pgn
        }
      }).then((data) => {
        if (!data) {
          this.saveToProfileStatus = 'Unknown error'
          return
        }

        if (!data.success) {
          this.saveToProfileStatus = data.message
          return
        }

        this.saveToProfileStatus = 'success'
      })
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
