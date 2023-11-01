<template>
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
              <v-select v-model="result" :items="results" :item-props="resultProps" label="Result" />
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
          <v-row v-if="showTournamentSettings">
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
        <v-btn color="blue-darken-1" variant="text" :loading="saving" @click="saveButtonClicked">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Chess } from 'chess.js'
import type { Integrations } from '~/types/integrations'
import type { TableGames, TableIntegrations, TournamentJson } from '~/types/supabase'
import type { USCFMemberTournament, USCFTournament } from '~/types/uscf'
import { results } from '~/utils/pgn'

type roundImproved = {
  roundNumber: number;
  result: string;
  color: string;
  opponentPairNumber: number;
  opponentName?: string;
}[]

export default {
  name: 'EditGameDialog',

  props: {
    showTournamentSettings: {
      type: Boolean,
      default: false
    },
    userId: {
      type: String,
      default: ''
    },
    game: {
      type: Object as PropType<TableGames>,
      default: null
    }
  },

  emits: ['save'],

  setup() {
    return {
      results
    }
  },

  data() {
    return {
      // State
      dialog: false,
      saving: false,

      // PGN Options
      black: 'Player',
      blackElo: null as string | null,
      white: 'Player',
      whiteElo: null as string | null,
      event: '',
      timeControl: '',
      date: '',
      result: '*',

      // Tournament options
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
      rounds: [] as roundImproved
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
    if (this.game) {
      const chess = new Chess()
      chess.loadPgn(this.game.pgn)
      const headers = chess.header()

      for (const header in headers) {
        let key = header as keyof typeof headers
        // lowercase first letter
        key = key.charAt(0).toLowerCase() + key.slice(1)

        // @ts-ignore
        if (this.$data[key] !== undefined) {
          // @ts-ignore
          this.$data[key] = headers[header]
        }
      }

      if (this.game.tournament_info) {
        const tournamentInfo = this.game.tournament_info as TournamentJson
        if (tournamentInfo.type === 'uscf') {
          this.isTournament = true
          this.tournamentId = tournamentInfo.eventId
          this.tournamentSection = tournamentInfo.section
          this.tournamentPlayer = tournamentInfo.player
          this.tournamentOpponent = tournamentInfo.opponent
        }
      }
    }
  },

  methods: {
    saveButtonClicked() {
      this.$emit('save', this.$data, this.buildPGN(), this.buildTournamentInfo())
    },

    buildPGN() {
      const data: Record<string, string> = {}

      if (this.white) { data.White = this.white }
      if (this.whiteElo) { data.WhiteElo = this.whiteElo }
      if (this.black) { data.Black = this.black }
      if (this.blackElo) { data.BlackElo = this.blackElo }
      if (this.event) { data.Event = this.event }
      if (this.timeControl) { data.TimeControl = this.timeControl }
      if (this.date) { data.Date = this.date }
      if (this.result) { data.Result = this.result }

      return data
    },

    buildTournamentInfo() {
      if (!this.isTournament) {
        return null
      }

      const data: TournamentJson = {
        type: 'uscf',
        eventId: this.tournamentId.toString(),
        section: this.tournamentSection,
        player: this.tournamentPlayer,
        opponent: this.tournamentOpponent
      }

      return data
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
    }
  }
}
</script>

<style>
/* Your component's styles here */
</style>
