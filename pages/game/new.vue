<template>
  <div class="row">
    <div class="col-md-8">
      <div class="mb-3">
        <v-btn @click="boardAPI?.toggleOrientation()">
          Toggle orientation
        </v-btn>
        <v-btn @click="handleReset">
          Reset
        </v-btn>
        <v-btn @click="handleUndo">
          Undo
        </v-btn>
        <v-btn @click="boardAPI?.toggleMoves()">
          Threats
        </v-btn>
        <v-btn @click="randomMove">
          Random Move
        </v-btn>
      </div>
      <the-chessboard
        :board-config="boardConfig"
        @board-created="(api) => (boardAPI = api)"
        @check="handleCheck"
        @move="handleMove"
        @checkmate="handleCheckmate"
      />
    </div>
    <div class="col-md-4">
      <h2>Moves</h2>
      <table class="table">
        <tr>
          <th>Move #</th>
          <th>White</th>
          <th>Black</th>
        </tr>
        <tr v-for="(move, index) in history" :key="index">
          <td>{{ index + 1 }}</td>
          <td v-if="move[0]">
            {{ move[0].san }}
          </td>
          <td v-if="move[1]">
            {{ move[1].san }}
          </td>
        </tr>
      </table>

      <a href="#" @click="downloadPGN">Download PGN</a>
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

  data() {
    return {
      boardAPI: null as BoardApi | null,
      boardConfig: {
        coordinates: true
      },
      history: [[]] as Move[][]
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

    handleUndo() {
      this.boardAPI?.undoLastMove()
      this.history[this.history.length - 1].pop()
      if (this.history[this.history.length - 1].length === 0) {
        this.history.pop()
      }
    },

    handleReset() {
      this.boardAPI?.resetBoard()
      this.history = [[]]
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
