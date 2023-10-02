<template>
  <main>
    <h1 v-if="memberPending || memberInfo == null">
      US Chess Member: Loading...
    </h1>
    <h1 v-else>
      US Chess Member: <ChessTitle v-if="title() !== 'Untitled'" :title="title()" /> {{ memberInfo.member.name }}
    </h1>

    <p>Member ID: {{ memberId }}</p>
    <p><a :href="`https://www.uschess.org/msa/MbrDtlMain.php?${memberId}`">View on USChess MSA</a></p>

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
      Gender: {{ memberInfo.gender }}<br>
      <span v-if="memberInfo.fide.id">
        FIDE ID: {{ memberInfo.fide.id }} ({{ memberInfo.fide.country }})<br>
      </span>
    </p>
    <h2>Ratings</h2>
    <div class="row">
      <div class="col-md-4 col-sm-12">
        <rating-card name="Regular" :data="memberInfo?.ratings?.regular" fa-icon="fas fa-stopwatch" />
      </div>
      <div class="col-md-4 col-sm-12">
        <rating-card name="Quick" :data="memberInfo?.ratings?.quick" fa-icon="fas fa-bolt" />
      </div>
      <div class="col-md-4 col-sm-12">
        <rating-card name="Blitz" :data="memberInfo?.ratings?.blitz" fa-icon="fas fa-forward-fast" />
      </div>
    </div>
    <div class="row">
      <div class="col-md-4 col-sm-12">
        <rating-card name="Online Regular" :data="memberInfo?.ratings?.online_regular" fa-icon="fas fa-stopwatch" card-color="success" />
      </div>
      <div class="col-md-4 col-sm-12">
        <rating-card name="Online Quick" :data="memberInfo?.ratings?.online_quick" fa-icon="fas fa-bolt" card-color="success" />
      </div>
      <div class="col-md-4 col-sm-12">
        <rating-card name="Online Blitz" :data="memberInfo?.ratings?.online_blitz" fa-icon="fas fa-forward-fast" card-color="success" />
      </div>
    </div>
    <h2>Tournament History</h2>
    <div v-if="tournamentsPending || tournaments == null">
      We're loading their tournament history, please wait...
    </div>
    <div v-else>
      <p>Total events (since late 1991): {{ tournaments.totalEvents }}</p>
      <div class="table-responsive">
        <table class="table table-striped table-bordered table-hover">
          <thead class="table-dark">
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
              <td>{{ tournament.date }}<br>{{ tournament.eventId }}</td>
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
        </table>
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

  data() {
    return {
      memberId: '',

      memberInfo: null as USCFMember | null,
      memberPending: true,

      tournaments: null as { success: boolean, tournaments: USCFMemberTournament[], page: number, totalPages: number, totalEvents: number } | null,
      tournamentsPending: true
    }
  },

  beforeMount() {
    const route = useRoute()
    const uscfUserId = route.params.id.toString()
    this.memberId = uscfUserId

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
