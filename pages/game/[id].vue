<template>
  <v-row autofocus tabindex="-1" @keydown.prevent="keyDown">
    <v-col md="8">
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
        <edit-game-dialog :show-tournament-settings="true" :user-id="userId" :game="game" @save="savePGN" />
        <v-dialog v-if="isGameOwner" width="500">
          <template #activator="{ props }">
            <v-btn v-bind="props" color="red">
              <i class="fas fa-trash-can" />&nbsp;Delete
            </v-btn>
          </template>

          <template #default="{ isActive }">
            <v-card title="Confirmation">
              <v-card-text>
                Are you sure you want to delete this game? This cannot be undone!
              </v-card-text>

              <v-card-actions>
                <v-spacer />

                <v-btn text="Confirm" color="red" :loading="deleting" @click="deleteGame" />
                <v-btn text="Cancel" @click="isActive.value = false" />
              </v-card-actions>
            </v-card>
          </template>
        </v-dialog>
      </div>

      <p v-if="game.platform == 'lichess'">
        This game was imported from Lichess! <page-link text="Click to view it" :href="`https://lichess.org/${game.platform_id}`" />.
      </p>

      <p v-if="game?.tournament_info">
        This game was from a tournament!
        <PageLink :href="`/uscf/tournament/${game?.tournament_info.eventId}`">
          Click to view it.
        </PageLink>
      </p>

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
        @board-created="(api) => handleBoardCreated(api)"
        @move="handleMove"
      />

      <v-row class="row g-3 align-items-center">
        <v-col>
          <v-col cols="6">
            <v-card variant="tonal">
              <v-card-text>
                {{ whiteOnBottom ? white : black }}
                <span v-if="whiteOnBottom ? whiteElo : blackElo" class="text-grey-darken-1">
                  ({{ whiteOnBottom ? whiteElo : blackElo }})
                </span>
              </v-card-text>
            </v-card>
          </v-col>
        </v-col>
      </v-row>
    </v-col>
    <v-col md="4">
      <h2>Moves</h2>

      <p v-if="opening">
        Opening: {{ opening }}
      </p>

      <div class="mb-3">
        <v-btn color="blue" @click="downloadPGN">
          Download PGN
        </v-btn>
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
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { BoardApi, TheChessboard } from 'vue3-chessboard'
import type { BoardConfig } from 'vue3-chessboard'
import 'vue3-chessboard/style.css'
import type { Move } from 'chess.js'
import type { Database, TableGames, TournamentJson } from '~/types/supabase'

export default defineComponent({
  name: '[id]',

  components: {
    TheChessboard
  },

  async setup() {
    const user = useSupabaseUser().value
    const route = useRoute()
    const id = route.params.id

    useSeoMeta({
      title: 'Game Viewer',
      description: 'View this game of chess on Chess.Tools! See all the moves, the details, and more!'
    })

    let game: TableGames | null = null
    let isGameOwner = false
    const res = await useSupabaseClient<Database>().from('games').select('*').eq('id', id).single()
    const data = res.data
    if (!data) {
      // throw 404
      throw showError({ statusCode: 500, statusMessage: 'Error fetching game! DATA IS GONE??' })
    }

    game = data

    if (game == null) {
      throw showError({ statusCode: 404, statusMessage: 'Game Not Found' })
    }

    isGameOwner = user?.id === game.user_id

    return {
      userId: user?.id,
      gameId: id,
      isGameOwner,
      game
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
      index: 0,
      opening: '' as string | null,
      whiteOnBottom: true,
      dialog: false,
      saving: false,
      deleting: false,

      white: 'meow',
      whiteElo: '0',
      black: 'meow',
      blackElo: '0'
    }
  },

  methods: {
    handleToggleOrientation() {
      this.boardAPI?.toggleOrientation()
      this.whiteOnBottom = !this.whiteOnBottom
    },

    async handleMove() {
      const move = this.history.flat()[this.index - 1]

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
      setImmediate(() => {
        this.boardAPI?.loadPgn(this.game.pgn)
        this.createHistory()
        this.updatePlayerInfo()
      })
      setImmediate(() => {
        this.boardAPI?.getOpeningName().then((data) => {
          this.opening = data
        })
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
    },

    switchMove(previous: boolean = false) {
      if (previous) {
        this.index -= 1
        this.boardAPI?.viewHistory(this.index)
      } else {
        this.index += 1
        this.boardAPI?.viewHistory(this.index)
      }

      this.handleMove()
    },

    historyAt(index: number) {
      this.index = index
      this.boardAPI?.viewHistory(this.index)

      this.handleMove()
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

    updatePlayerInfo() {
      const pgn = this.boardAPI?.getPgnInfo()
      if (!pgn) {
        return
      }

      if (pgn.White) { this.white = pgn.White }
      if (pgn.WhiteElo) { this.whiteElo = pgn.WhiteElo }
      if (pgn.Black) { this.black = pgn.Black }
      if (pgn.BlackElo) { this.blackElo = pgn.BlackElo }
    },

    async savePGN(data: Record<string, any>, pgn: Record<string, string>, tournamentInfo: TournamentJson | null) {
      data.saving = true

      this.boardAPI?.setPgnInfo(pgn)

      const body: Record<string, string | object | undefined> = {
        pgn: this.boardAPI?.getPgn()
      }

      if (tournamentInfo) {
        body.tournament_info = tournamentInfo
      }

      const { data: supaData, error } = await useSupabaseClient<Database>()
        .from('games')
        .update(body)
        .eq('id', this.gameId).select()
      data.saving = false

      this.updatePlayerInfo()

      if (error) {
        console.error(error)
      }

      if (supaData) {
        data.dialog = false
        this.game = supaData[0]
      }
    },

    async deleteGame() {
      this.deleting = true
      await useSupabaseClient<Database>().from('games').delete().eq('id', this.gameId)

      navigateTo('/games')
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
