<template>
  <main>
    <h1 v-if="memberPending || memberInfo == null">
      US Chess Member: Loading...
    </h1>
    <h1 v-else>
      US Chess Member: <ChessTitle v-if="title() !== 'Untitled'" :title="title()" /> {{ memberInfo.member.name }}
    </h1>

    <p>Member ID: {{ memberId }}</p>
    <p><page-link :href="`https://www.uschess.org/msa/MbrDtlMain.php?${memberId}`" text="View on USChess MSA" /></p>

    <h2 v-if="titles().length > 0">
      Titles
    </h2>
    <ul v-if="titles().length > 0">
      <li v-for="chessTitle in titles()" :key="chessTitle">
        {{ chessTitle }}
      </li>
    </ul>

    <h2>Member Info</h2>
    <p v-if="memberPending || memberInfo == null" class="placeholder-glow">
      State: <span class="placeholder">:3</span><br>
      Gender: <span class="placeholder">:3</span><br>
    </p>
    <p v-else>
      State: {{ memberInfo.state }}<br>
      <v-tooltip text="'Gender' is referring to this player's legal sex and may not accurately reflect their gender identity." location="top">
        <template #activator="{ props }">
          <span v-bind="props" style="text-decoration: underline dotted">Gender</span>
        </template>
      </v-tooltip>: {{ memberInfo.gender }}<br>
      <span v-if="memberInfo.fide.id">
        FIDE ID: {{ memberInfo.fide.id }} ({{ memberInfo.fide.country }})<br>
      </span>
    </p>

    <h2>Ratings</h2>
    <v-row>
      <v-col md="4" cols="12" sm="12">
        <rating-card name="Regular" :data="memberInfo?.ratings?.regular" icon="timer-outline" />
      </v-col>
      <v-col md="4" cols="12" sm="12">
        <rating-card name="Quick" :data="memberInfo?.ratings?.quick" icon="flash" />
      </v-col>
      <v-col md="4" cols="12" sm="12">
        <rating-card name="Blitz" :data="memberInfo?.ratings?.blitz" icon="fast-forward" />
      </v-col>
    </v-row>
    <v-row>
      <v-col md="4" cols="12" sm="12">
        <rating-card name="Online Regular" :data="memberInfo?.ratings?.online_regular" icon="timer-outline" card-color="success" />
      </v-col>
      <v-col md="4" cols="12" sm="12">
        <rating-card name="Online Quick" :data="memberInfo?.ratings?.online_quick" icon="flash" card-color="success" />
      </v-col>
      <v-col md="4" cols="12" sm="12">
        <rating-card name="Online Blitz" :data="memberInfo?.ratings?.online_blitz" icon="fast-forward" card-color="success" />
      </v-col>
    </v-row>

    <h2>Rankings</h2>
    <v-row v-if="memberInfo?.rankings">
      <v-col v-if="memberInfo.rankings.overall" md="4">
        <h3>Overall</h3>
        <p>
          {{ memberInfo.rankings.overall.rank }}
          <span v-if="memberInfo.rankings.overall.tied">(tied)</span>
          out of {{ memberInfo.rankings.overall.total }}<br>
          {{ memberInfo.rankings.overall.percentile }} percentile
        </p>
        <rank-pie-chart :member-info="memberInfo.rankings.overall" />
      </v-col>
      <v-col v-if="memberInfo.rankings.gender" md="4">
        <h3>Gender ({{ memberInfo.gender }})</h3>
        <p>
          {{ memberInfo.rankings.gender.rank }}
          <span v-if="memberInfo.rankings.gender.tied">(tied)</span>
          out of {{ memberInfo.rankings.gender.total }}<br>
          {{ memberInfo.rankings.gender.percentile }} percentile
        </p>
        <rank-pie-chart :member-info="memberInfo.rankings.gender" />
      </v-col>
      <v-col v-if="memberInfo.rankings.state" md="4">
        <h3>State ({{ memberInfo.state }})</h3>
        <p>
          {{ memberInfo.rankings.state.rank }}
          <span v-if="memberInfo.rankings.state.tied">(tied)</span>
          out of {{ memberInfo.rankings.state.total }}<br>
          {{ memberInfo.rankings.state.percentile }} percentile
        </p>
        <rank-pie-chart :member-info="memberInfo.rankings.state" />
      </v-col>
    </v-row>
    <p v-else>
      No rankings available. Rankings are only available to players who have played a rated tournament in the last 12 months.
    </p>

    <h2>Tournament History</h2>
    <div v-if="tournamentsPending || tournaments == null">
      We're loading their tournament history, please wait...
    </div>
    <div v-else>
      <p>Total events (since late 1991): {{ tournaments.totalEvents }}</p>
      <div class="table-responsive">
        <v-table theme="dark">
          <thead>
            <tr>
              <th>
                Date<br>ID
              </th>
              <th>Name<br>Section</th>
              <th>Regular Rating</th>
              <th>Quick Rating</th>
              <th>Blitz</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tournament in tournaments.tournaments" :key="tournament.eventId">
              <td>
                {{ tournament.date }}<br>
                <page-link :href="`/uscf/tournament/${tournament.eventId}`" :text="tournament.eventId.toString()" />
              </td>
              <td>{{ tournament.name }}<br>{{ tournament.section.id }}: {{ tournament.section.name }}</td>

              <!-- Regular -->
              <td v-if="tournament.ratings.regular == null">
                No Change
              </td>
              <td v-else-if="tournament.ratings.regular">
                <span v-if="tournament.ratings.regular.online" class="text-success">Online<br></span>
                {{ tournament.ratings.regular.previousElo || "(Unrated)" }} => {{ tournament.ratings.regular.newElo }}
              </td>

              <!-- Quick -->
              <td v-if="tournament.ratings.quick == null">
                No Change
              </td>
              <td v-else-if="tournament.ratings.quick">
                <span v-if="tournament.ratings.quick.online" class="text-success">Online<br></span>
                {{ tournament.ratings.quick.previousElo || "(Unrated)" }} => {{ tournament.ratings.quick.newElo }}
              </td>

              <!-- Blitz -->
              <td v-if="tournament.ratings.blitz == null">
                No Change
              </td>
              <td v-else-if="tournament.ratings.blitz">
                <span v-if="tournament.ratings.blitz.online" class="text-success">Online<br></span>
                {{ tournament.ratings.blitz.previousElo || "(Unrated)" }} => {{ tournament.ratings.blitz.newElo }}
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { USCFMember, USCFMemberTournament } from '~/types/uscf'
import { useLazyFetch } from '#app'

export default defineComponent({
  name: '[id]',

  setup() {
    useSeoMeta({
      title: 'View USCF Member',
      description: 'See all the stats for this USCF member. View ratings, tournaments, and more!'
    })

    const route = useRoute()
    const uscfUserId = route.params.id.toString()
    return {
      memberId: uscfUserId
    }
  },

  data() {
    return {
      memberInfo: null as USCFMember | null,
      memberPending: true,

      tournaments: null as { success: boolean, tournaments: USCFMemberTournament[], page: number, totalPages: number, totalEvents: number } | null,
      tournamentsPending: true
    }
  },

  beforeMount() {
    const route = useRoute()
    const uscfUserId = route.params.id.toString()

    this.memberPending = true
    useLazyFetch<USCFMember>(`/api/uscf/member/${uscfUserId}`, {
      key: `uscf-member-${uscfUserId}`,
      server: false
    }).then(({ data }) => {
      // @ts-ignore TS Really seems to think data is a ref, it's not
      this.memberInfo = data
      this.memberPending = false
    })

    this.tournamentsPending = true
    useLazyFetch(`/api/uscf/member/${uscfUserId}/tournaments`, {
      key: `uscf-member-${uscfUserId}-tournaments`,
      server: false
    }).then(({ data }) => {
      // @ts-ignore TS Really seems to think data is a ref, it's not
      this.tournaments = data
      this.tournamentsPending = false
    })
  },

  methods: {
    title() {
      if (this.memberInfo == null) {
        return 'Loading...'
      }

      // check for fide titles
      if (this.memberInfo.fide.titles.length > 0) {
        return this.memberInfo.fide.titles[0]
      }

      // check for NM title
      if (this.memberInfo.titles.includes('National Master')) {
        return 'National Master'
      }

      return 'Untitled'
    },

    titles() {
      if (this.memberInfo == null) {
        return []
      }

      let titles: string[] = []

      // add FIDE titles, but suffix them with (FIDE)
      titles = titles.concat(this.memberInfo.fide.titles.map(title => `${title} (FIDE)`))

      // add uscf titles
      titles = titles.concat(this.memberInfo.titles)

      return titles
    }
  }
})
</script>

<style scoped>

</style>
