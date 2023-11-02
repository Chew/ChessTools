<template>
  <v-row>
    <v-col md="8">
      <div class="mb-3">
        <v-btn color="blue" class="mr-1" @click="handleOrientation">
          Switch Sides
        </v-btn>
        <v-dialog width="500">
          <template #activator="{ props }">
            <v-btn v-bind="props" color="red" class="mr-1">
              Reset
            </v-btn>
          </template>

          <template #default="{ isActive }">
            <v-card title="Confirmation">
              <v-card-text>
                Are you sure you want to reset the board? This does not wipe the PGN.
              </v-card-text>

              <v-card-actions>
                <v-spacer />

                <v-btn text="Confirm" color="red" @click="handleReset(isActive)" />
                <v-btn text="Cancel" @click="isActive.value = false" />
              </v-card-actions>
            </v-card>
          </template>
        </v-dialog>
        <v-btn color="orange" class="mr-1" @click="handleUndo">
          Undo
        </v-btn>
        <v-btn color="yellow" class="mr-1" @click="boardAPI?.toggleMoves()">
          Possible Moves
        </v-btn>
        <v-btn color="green" class="mr-1" @click="randomMove">
          Random Move
        </v-btn>
        <edit-game-dialog @save="savePGN" />
      </div>
      <p>Game State: {{ status }}</p>
      <v-row class="row g-3 align-items-center mb-1">
        <v-col cols="6">
          <v-card variant="tonal">
            <v-card-text>
              {{ whiteOnBottom ? black : white }}
              <span v-if="whiteOnBottom ? blackElo : whiteElo" class="text-grey-darken-1">
                ({{ whiteOnBottom ? blackElo : whiteElo }})
              </span>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <the-chessboard
        :board-config="boardConfig"
        @board-created="(api) => (boardAPI = api)"
        @check="handleCheck"
        @move="handleMove"
        @checkmate="handleCheckmate"
      />

      <v-row class="row g-3 align-items-center">
        <v-col>
          <v-col cols="6">
            <v-card variant="tonal">
              <v-card-text>
                {{ whiteOnBottom ? white : black }}
                <span v-if="whiteOnBottom ? whiteElo : blackElo" class="text-grey-darken-1">
                  ({{ whiteOnBottom ? blackElo : blackElo }})
                </span>
              </v-card-text>
            </v-card>
          </v-col>
        </v-col>
      </v-row>
    </v-col>
    <v-col md="4">
      <h2>Moves</h2>

      <div class="mb-3">
        <v-btn v-if="history.flat().length > 0" color="blue" class="mr-3" @click="downloadPGN($el)">
          Download PGN
        </v-btn>
        <v-dialog v-else v-model="uploadDialog" width="1024">
          <template #activator="{ props }">
            <v-btn color="lime" class="mr-3" v-bind="props">
              Upload PGN
            </v-btn>
          </template>
          <v-card height="576">
            <v-card-title>
              <span class="text-h5">Upload PGN</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <!-- big ol text box -->
                <v-textarea v-model="pgn" rows="12" label="PGN" />
                <!-- tiny file upload box -->
                <v-file-input v-model="pgnFile" label="PGN File" prepend-icon="mdi-upload" />
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn text="Cancel" @click="uploadDialog = false" />
              <v-btn color="blue-darken-1" variant="text" @click="uploadPGN">
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-btn v-if="useSupabaseUser() && saveToProfileStatus === 'pending'" color="blue" :disabled="history.flat().length == 0"
               @click.prevent="saveToProfile">
          Save to Profile
        </v-btn>
        <v-btn v-else-if="saveToProfileStatus === 'sending'" color="grey" :disabled="true">
          <v-progress-circular indeterminate :size="15" :width="2" />&nbsp;Saving...
        </v-btn>
        <v-btn v-else-if="saveToProfileStatus === 'success'" color="green" :disabled="true">
          <i class="fas fa-check" /> Saved!
        </v-btn>
        <v-btn v-else color="red" :disabled="true">
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
import { BoardApi, type Promotion, TheChessboard } from 'vue3-chessboard'
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
      pgn: '',
      pgnFile: undefined as File[] | undefined,

      // PGN Info
      black: 'Player',
      blackElo: null as number | null,
      white: 'Player',
      whiteElo: null as number | null,
      event: '',
      timeControl: '',
      result: '*',

      dialog: false,
      uploadDialog: false
    }
  },

  // watch for file upload
  watch: {
    pgnFile: {
      handler(val) {
        if (!this.pgnFile) {
          return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          if (!e.target) {
            return
          }

          this.pgn = e.target.result as string
        }
        reader.readAsText(this.pgnFile[0])
      },
      immediate: true
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

    handleReset(isActive: Ref<boolean>) {
      const pgn = this.boardAPI?.getPgnInfo()
      this.boardAPI?.resetBoard()
      if (pgn) {
        // remove all undefined keys from pgn
        for (const key in pgn) {
          const info = pgn[key]
          if (info === undefined) {
            delete pgn[key]
          }
        }
        this.boardAPI?.setPgnInfo(pgn as Record<string, string>)
      }
      this.status = 'Pending'
      this.saveToProfileStatus = 'pending'
      this.history = [[]]
      this.whiteOnBottom = true
      isActive.value = false
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

    savePGN(data: Record<string, any>, pgn: Record<string, string>) {
      const pgnInfo = this.boardAPI?.getPgnInfo()
      if (!pgnInfo) {
        return
      }

      data.saving = true

      const pgnData: Record<string, string> = {}
      // add all non-undefined keys from pgnInfo
      for (const key in pgnInfo) {
        const info = pgnInfo[key]
        if (info === undefined) {
          continue
        }
        pgnData[key] = info
      }

      for (const key in pgn) {
        const info = pgn[key]
        if (info === undefined) {
          continue
        }
        pgnData[key] = info
      }

      this.boardAPI?.setPgnInfo(pgnData)

      this.white = pgnData.White
      this.black = pgnData.Black
      this.whiteElo = pgnData.WhiteElo ? parseInt(pgnData.WhiteElo) : null
      this.blackElo = pgnData.BlackElo ? parseInt(pgnData.BlackElo) : null

      data.saving = false
      data.dialog = false
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

    uploadPGN() {
      this.boardAPI?.loadPgn(this.pgn)
      this.createHistory()

      this.uploadDialog = false

      const pgn = this.boardAPI?.getPgnInfo()
      if (!pgn) {
        return
      }

      this.addPGN('white', pgn.White)
      this.addPGN('black', pgn.Black)
      this.addPGN('whiteElo', pgn.WhiteElo)
      this.addPGN('blackElo', pgn.BlackElo)
      this.addPGN('event', pgn.Event)
      this.addPGN('timeControl', pgn.TimeControl)
      this.addPGN('result', pgn.Result)
    },

    addPGN(data: string, val: any) {
      // @ts-ignore
      this.$data[data] = val
    },

    createHistory() {
      this.history = [[]]
      const history = this.boardAPI?.getHistory(true)
      if (!history) {
        return
      }

      for (const move of history) {
        this.addToHistory(move)
      }
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
