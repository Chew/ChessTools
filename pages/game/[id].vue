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
        <v-dialog v-if="isGameOwner" v-model="dialog" :persistent="true" width="1024">
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
                <v-row v-if="isGameOwner">
                  <h2>Tournament Info</h2>
                  <v-col cols="12" class="mb-0">
                    <v-checkbox v-model="isTournament" label="Did you play this game in a US Chess/FIDE Rated tournament?" />
                  </v-col>
                  <v-col v-if="isTournament && canMarkTournament" md="6">
                    <v-select v-model="tournamentId" label="Tournament" :loading="retrievingTournaments" :items="tournaments"
                              item-title="name" item-value="eventId">
                      <template #item="{ props, item }">
                        <v-list-item v-bind="props" :subtitle="item.raw.date" />
                      </template>
                    </v-select>
                  </v-col>
                  <v-col v-else-if="isTournament" md="12">
                    <v-alert type="error" text="You must have a verified US Chess integration to use this feature!" />
                  </v-col>
                  <v-col v-if="isTournament && tournamentId != ''">
                    <v-select v-model="tournamentOpponent" :items="rounds" :loading="retrievingTournament"
                              item-title="opponentName" item-value="opponentPairNumber" label="Opponent">
                      <template #item="{ props, item }">
                        <v-list-item v-bind="props" :subtitle="'Round ' + item.raw.roundNumber" />
                      </template>
                    </v-select>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn color="blue-darken-1" variant="text" @click="dialog = false">
                Close
              </v-btn>
              <v-btn color="blue-darken-1" variant="text" :loading="saving" @click="savePGN">
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
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

      <p v-if="game?.tournament_info">
        This game was from a tournament!
        <PageLink :href="`/uscf/tournament/${game?.tournament_info.eventId}`">
          Click to view it.
        </PageLink>
      </p>

      <v-row class="row g-3 align-items-center">
        <v-col>
          <v-text-field v-if="whiteOnBottom" v-model="black" type="text" :readonly="true" label="Black" />
          <v-text-field v-else v-model="white" type="text" :readonly="true" label="White" />
        </v-col>
      </v-row>

      <the-chessboard
        :board-config="boardConfig"
        @board-created="(api) => handleBoardCreated(api)"
        @move="handleMove"
      />

      <v-row class="row g-3 align-items-center mt-3">
        <v-col>
          <v-text-field v-if="whiteOnBottom" v-model="white" type="text" :readonly="true" label="White" />
          <v-text-field v-else v-model="black" type="text" :readonly="true" label="Black" />
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
import { BoardApi, BoardConfig, TheChessboard } from 'vue3-chessboard'
import 'vue3-chessboard/style.css'
import type { Move } from 'chess.js'
import { useSupabaseClient } from '#imports'
import { Database, TableGames, TableIntegrations, TournamentJson } from '~/types/supabase'
import { resultProps, results } from '~/utils/pgn'
import { USCFMemberTournament, USCFTournament } from '~/types/uscf'
import { Integrations } from '~/types/integrations'

type roundImproved = {
  roundNumber: number;
  result: string;
  color: string;
  opponentPairNumber: number;
  opponentName?: string;
}[]

export default defineComponent({
  name: '[id]',

  components: {
    TheChessboard
  },

  setup() {
    const user = useSupabaseUser().value
    const route = useRoute()
    const id = route.params.id

    useSeoMeta({
      title: 'Game Viewer',
      description: 'View this game of chess on Chess.Tools! See all the moves, the details, and more!'
    })

    return {
      userId: user?.id,
      gameId: id
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
      isGameOwner: false,
      saving: false,
      deleting: false,

      // Tournament info
      uscfId: 0 as string | number,
      isTournament: false,
      tournaments: [] as USCFMemberTournament[],
      tournament: null as USCFTournament | null,
      retrievingTournaments: false,
      retrievingTournament: false,
      retrievedTournaments: false,
      canMarkTournament: true,
      tournamentId: 0 as number | string,
      tournamentSection: 0 as number,
      tournamentPlayer: 0 as number,
      tournamentOpponent: 0 as number,
      rounds: [] as roundImproved,

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

  watch: {
    // watch for isTournament changes
    isTournament: {
      handler: function (val) {
        if (val && !this.retrievedTournaments && !this.retrievingTournaments) {
          this.retrieveTournaments()
        }
      }
    },
    // watch for tournamentId changes
    tournamentId: {
      handler: function (val) {
        if (val && !this.retrievingTournament) {
          this.retrieveTournament()
        }
      }
    }
  },

  beforeMount() {
    useSupabaseClient<Database>().from('games').select('*').eq('id', this.gameId).then((res) => {
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

      this.isGameOwner = this.userId === this.game.user_id

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

      if (this.game.tournament_info && this.isGameOwner) {
        this.isTournament = true
        this.tournamentId = this.game.tournament_info.eventId
        this.tournamentSection = this.game.tournament_info.section
        this.tournamentPlayer = this.game.tournament_info.player
        this.tournamentOpponent = this.game.tournament_info.opponent
      }
    })
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

      const body: Record<string, string | object | undefined> = {
        pgn: this.boardAPI?.getPgn()
      }

      if (this.isTournament) {
        body.tournament_info = {
          type: 'uscf',
          eventId: this.tournamentId.toString(),
          section: this.tournamentSection,
          player: this.tournamentPlayer,
          opponent: this.tournamentOpponent
        } as TournamentJson
      }

      this.saving = true
      const { data: supaData, error } = await useSupabaseClient<Database>()
        .from('games')
        .update(body)
        .eq('id', this.gameId).select()
      this.saving = false

      if (error) {
        console.error(error)
      }

      if (supaData) {
        this.dialog = false
        this.game = supaData[0]
      }
    },

    async retrieveTournaments() {
      this.retrievingTournaments = true

      // get us chess ID
      let verifiedUscf = false
      await $fetch<{success: boolean, error: string, integrations: Record<Integrations, TableIntegrations>}>(`/api/users/${this.userId}/integrations`)
        .then((data) => {
          if (!data) {
            throw showError('Unknown error')
          }

          if (!data.success) {
            // @ts-ignore error is just guaranteed to be a string here
            throw showError(data.error)
          }

          this.uscfId = data.integrations.uscf?.data.id || 0
          verifiedUscf = data.integrations.uscf?.verified
        })

      if (this.uscfId === 0 || !verifiedUscf) {
        this.canMarkTournament = false
        this.retrievingTournaments = false
        this.retrievedTournaments = true
        return
      }

      // get tournaments
      await $fetch<{success: boolean, error: string, tournaments: USCFMemberTournament[]}>(`/api/uscf/member/${this.uscfId}/tournaments`)
        .then((data) => {
          if (!data) {
            throw showError('Unknown error')
          }

          if (!data.success) {
            // @ts-ignore error is just guaranteed to be a string here
            throw showError(data.error)
          }

          this.tournaments = data.tournaments
        })

      this.retrievingTournaments = false
      this.retrievedTournaments = true
    },

    async retrieveTournament() {
      this.retrievingTournament = true
      await $fetch<USCFTournament>(`/api/uscf/tournament/${this.tournamentId}`)
        .then((data) => {
          if (!data) {
            throw showError('Unknown error')
          }

          if (!data.success) {
            // @ts-ignore error is just guaranteed to be a string here
            throw showError(data.error)
          }

          this.tournament = data
        })

      this.retrievingTournament = false
      this.findSectionRounds()
    },

    findSectionRounds(): [] | undefined {
      const tournament = this.tournaments.find(e => e.eventId.toString() === this.tournamentId.toString())
      if (!tournament) {
        return []
      }

      const sectionId = tournament.section.id
      if (!sectionId) {
        return []
      }

      const section = this.tournament?.sections.find(e => e.id === sectionId)

      if (!section) {
        return []
      }

      // build the rounds
      const player = section.players.find(e => e.memberId === this.uscfId)
      if (!player) {
        return []
      }

      const rounds: roundImproved = player.rounds

      // get player names >:3
      const playerNameMap: Record<number, string> = {}
      for (const player of section.players) {
        playerNameMap[player.pairNumber] = player.name
      }

      for (const round of rounds) {
        round.opponentName = playerNameMap[round.opponentPairNumber]
      }
      this.rounds = rounds
      this.tournamentSection = section.id
      this.tournamentPlayer = player.pairNumber
    },

    async deleteGame() {
      this.deleting = true
      await useSupabaseClient<Database>().from('games').delete().eq('id', this.gameId)

      navigateTo('/games')
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
