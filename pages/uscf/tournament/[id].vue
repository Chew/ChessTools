<template>
  <main>
    <h1>US Chess Tournament {{ gameData.summary.event.name }}</h1>
    <p>
      Location: {{ gameData.summary.location }}<br>
      Affiliate: {{ gameData.summary.affiliate.name }}<br>
      Date(s): {{ gameData.summary.eventDates }}<br>
      Entered: {{ gameData.summary.processed.entered }}<br>
      Received: {{ gameData.summary.processed.received }}<br>
      Rated: {{ gameData.summary.processed.rated }}
    </p>

    <h2>Sections</h2>
    <v-row>
      <v-col v-for="section in gameData.sections" :key="section.id" md="12" class="mb-3">
        <h3>{{ titleize(section.name) }}</h3>

        <v-row v-if="section.stats">
          <v-col md="6">
            <h4>Stats</h4>
            <p>
              Rounds: {{ section.stats.rounds }}<br>
              Players: {{ section.stats.players }}<br>
            </p>
          </v-col>
        </v-row>

        <v-data-table v-if="section.stats && section.players.length > 0" v-model:expanded="expanded[section.id - 1]" show-expand
                      :items-per-page="section.players.length > 10 ? 10 : -1"
                      :headers="buildHeaders(section.stats.rounds)" :items="section.players"
                      theme="dark" item-value="pairNumber" :search="search">
          <template #top>
            <v-toolbar :flat="true">
              <v-toolbar-title>Results</v-toolbar-title>
              <v-text-field
                v-model="search"
                prepend-inner-icon="mdi-magnify"
                label="Search"
                variant="solo-filled"
                single-line
                :clearable="true"
                hide-details
              />
            </v-toolbar>
          </template>
          <template #expanded-row="{ columns, item }">
            <tr>
              <td :colspan="columns.length">
                <uscf-tournament-player-info :player="item" :players="section.players" :games="findGames(section.id)" />
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </main>
</template>

<script lang="ts">
import { capitalize, defineComponent } from 'vue'
import { useSeoMeta } from 'unhead'
import titleize from 'titleize'
import { VDataTable } from 'vuetify/components/VDataTable'
import type { USCFTournament } from '~/types/uscf'
import type { DataTableHeader } from '~/types/vuetify'
import type { Database, TableGames } from '~/types/supabase'
import type { USCFTournamentResponse } from '~/types/requests'

export default defineComponent({
  name: '[id]',

  components: {
    VDataTable
  },

  async setup() {
    const route = useRoute()
    const id = route.params.id

    const gameData: USCFTournament = await $fetch<USCFTournamentResponse>(`/api/uscf/tournament/${id}`).then((data) => {
      return data
    })

    const title = 'Viewing Tournament ' + gameData.summary.event.name
    const description = 'View tournament info, players, rating changes, round breakdowns, and more!'
    useSeoMeta({
      title,
      description,
      ogTitle: title,
      ogDescription: description
    })

    return {
      gameData
    }
  },

  data() {
    return {
      expanded: [[]],
      associatedGames: [] as TableGames[],
      search: ''
    }
  },

  beforeMount() {
    this.expanded = this.gameData.sections.map(() => [])

    const route = useRoute()
    const id = route.params.id

    useSupabaseClient<Database>().from('games').select('*').eq('tournament_info->>eventId', id).then((data) => {
      if (data.error) {
        console.error(data.error)
        return
      }

      this.associatedGames = data.data as TableGames[]
    })
  },

  methods: {
    capitalize,

    buildHeaders(rounds: number): DataTableHeader[] {
      const startingHeaders: DataTableHeader[] = [{
        title: 'Place',
        align: 'start',
        sortable: true,
        key: 'pairNumber'
      }, {
        title: 'Name',
        align: 'start',
        sortable: true,
        key: 'name'
      }, {
        title: 'Points',
        align: 'center',
        sortable: true,
        key: 'totalPoints'
      }]

      for (let i = 0; i < rounds; i++) {
        startingHeaders.push({
          title: 'Round ' + (i + 1),
          align: 'center',
          sortable: true,
          key: 'rounds.' + i + '.result'
        })
      }

      return startingHeaders
    },

    findGames(section: number) {
      return this.associatedGames.filter((game) => {
        return game.tournament_info?.section === section
      })
    },

    titleize
  }
})
</script>

<style scoped>

</style>
