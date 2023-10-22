<template>
  <v-row>
    <v-col md="8">
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
        <v-dialog v-model="dialog" :persistent="true" width="1024">
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
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
      <p>Game State: {{ status }}</p>
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
    </v-col>
    <v-col md="4">
      <h2>Moves</h2>

      <div class="mb-3">
        <v-btn color="blue" class="mr-3" @click="downloadPGN($el)">
          Download PGN
        </v-btn>
        <v-btn v-if="useSupabaseUser() && saveToProfileStatus === 'pending'" color="blue" @click.prevent="saveToProfile">
          Save to Profile
        </v-btn>
        <v-btn v-else-if="saveToProfileStatus === 'sending'" color="grey" disabled>
          <v-progress-circular indeterminate :size="15" :width="2" />&nbsp;Saving...
        </v-btn>
        <v-btn v-else-if="saveToProfileStatus === 'success'" color="green" disabled>
          <i class="fas fa-check" /> Saved!
        </v-btn>
        <v-btn v-else color="red" disabled>
          <!-- failure -->
          <i class="fas fa-times" /> {{ saveToProfileStatus }}
        </v-btn>
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
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { BoardApi, Promotion, TheChessboard } from 'vue3-chessboard'
import 'vue3-chessboard/style.css'
import type { Move } from 'chess.js'
import { buildDate, resultProps, results } from '~/utils/pgn'

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

      // State
      saveToProfileStatus: 'pending',
      status: 'Pending',
      whiteOnBottom: true,

      // PGN Info
      black: 'Player',
      blackElo: null as number | null,
      white: 'Player',
      whiteElo: null as number | null,
      event: '',
      timeControl: '',
      result: '*',

      dialog: false
    }
  },

  methods: {
    resultProps,
    results() {
      return results
    },

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
      this.gameStatus()

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
      this.status = 'Pending'
      this.saveToProfileStatus = 'pending'
      this.history = [[]]
    },

    /**
     * Saves the game to your profile.
     */
    saveToProfile() {
      this.saveToProfileStatus = 'sending'

      this.updatePGN()
      const pgn = this.boardAPI?.getPgn()

      $fetch<{success: boolean, message: string}>('/api/games/save', {
        headers: useRequestHeaders(['cookie']),
        method: 'POST',
        body: {
          pgn
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

    updatePGN() {
      const data: Record<string, string> = {
        White: this.white,
        Black: this.black,
        Result: this.result,
        Site: 'Chess.Tools Game Scorecard',
        Date: buildDate()
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
    },

    downloadPGN(el: HTMLElement) {
      this.updatePGN()
      const pgn = this.boardAPI?.getPgn()
      if (!pgn) {
        return
      }
      const element = document.createElement('a')
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(pgn))
      element.setAttribute('download', 'game.pgn')
      element.style.display = 'none'
      el.appendChild(element)
      element.click()
      el.removeChild(element)
    },

    /**
     * Updates the game status based on the current board state.
     */
    gameStatus(): void {
      const api = this.boardAPI
      if (!api) {
        return
      }

      const toPlay = api.getTurnColor()

      if (!api.getIsGameOver()) {
        this.status = `In Progress, ${toPlay} to play`
        this.result = '*'
        return
      }

      if (api.getIsCheckmate()) {
        this.status = `${toPlay === 'white' ? 'Black' : 'White'} wins by Checkmate`
        this.result = toPlay === 'white' ? '0-1' : '1-0'
      } else if (api.getIsStalemate()) {
        this.status = 'Draw by Stalemate'
      } else if (api.getIsThreefoldRepetition()) {
        this.status = 'Draw by Threefold Repetition'
      } else if (api.getIsInsufficientMaterial()) {
        this.status = 'Draw by Insufficient Material'
      } else if (api.getIsDraw()) {
        this.status = 'Draw'
      } else {
        this.status = 'Game Over'
      }

      if (api.getIsDraw()) {
        this.result = '1/2-1/2'
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
