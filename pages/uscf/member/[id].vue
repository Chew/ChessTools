<template>
  <header v-if="mPending">
    <h1>US Chess Member: Loading...</h1>
  </header>
  <header v-else>
    <h1>US Chess Member: {{ memberInfo.member.name }}</h1>
    <p>Member ID: {{ memberInfo.member.id }}</p>
    <p><a :href="`https://www.uschess.org/msa/MbrDtlMain.php?${memberInfo.member.id}`">View on USChess MSA</a></p>
  </header>

  <main v-if="mPending">
    <p>Please wait, we're retrieving their data :)</p>
    <h2>Member Info</h2>
    <p class="placeholder-glow">
      State: <span class="placeholder">:3</span><br/>
      Gender: <span class="placeholder">:3</span><br/>
    </p>
    <h2>Ratings</h2>
    <div class="row">
      <div class="col-md-4 col-sm-12">
        <rating-card name="Regular" :placeholder="true" fa-icon="fas fa-stopwatch"></rating-card>
      </div>
      <div class="col-md-4 col-sm-12">
        <rating-card name="Quick" :placeholder="true" fa-icon="fas fa-bolt"></rating-card>
      </div>
      <div class="col-md-4 col-sm-12">
        <rating-card name="Blitz" :placeholder="true" fa-icon="fas fa-forward-fast"></rating-card>
      </div>
    </div>
    <div class="row">
      <div class="col-md-4 col-sm-12">
        <rating-card name="Regular" :placeholder="true" fa-icon="fas fa-stopwatch" card-color="success"></rating-card>
      </div>
      <div class="col-md-4 col-sm-12">
        <rating-card name="Quick" :placeholder="true" fa-icon="fas fa-bolt" card-color="success"></rating-card>
      </div>
      <div class="col-md-4 col-sm-12">
        <rating-card name="Blitz" :placeholder="true" fa-icon="fas fa-forward-fast" card-color="success"></rating-card>
      </div>
    </div>
  </main>
  <main v-else>
    <h2>Member Info</h2>
    <p>
      State: {{ memberInfo.state }}<br/>
      Gender: {{ memberInfo.gender }}<br/>
      <span v-if="memberInfo.fide.id">
        FIDE ID: {{ memberInfo.fide.id }} ({{ memberInfo.fide.country }})<br/>
      </span>
    </p>
    <h2>Ratings</h2>
    <div class="row">
      <div class="col-md-4 col-sm-12">
        <rating-card name="Regular" :data="memberInfo.ratings.regular" fa-icon="fas fa-stopwatch"></rating-card>
      </div>
      <div class="col-md-4 col-sm-12">
        <rating-card name="Quick" :data="memberInfo.ratings.quick" fa-icon="fas fa-bolt"></rating-card>
      </div>
      <div class="col-md-4 col-sm-12">
        <rating-card name="Blitz" :data="memberInfo.ratings.blitz" fa-icon="fas fa-forward-fast"></rating-card>
      </div>
    </div>
    <div class="row">
      <div class="col-md-4 col-sm-12">
        <rating-card name="Regular" :data="memberInfo.ratings.online_regular" fa-icon="fas fa-stopwatch" card-color="success"></rating-card>
      </div>
      <div class="col-md-4 col-sm-12">
        <rating-card name="Quick" :data="memberInfo.ratings.online_quick" fa-icon="fas fa-bolt" card-color="success"></rating-card>
      </div>
      <div class="col-md-4 col-sm-12">
        <rating-card name="Blitz" :data="memberInfo.ratings.online_blitz" fa-icon="fas fa-forward-fast" card-color="success"></rating-card>
      </div>
    </div>
    <h2>Tournament History</h2>
    <div v-if="tPending">
      We're loading their tournament history, please wait...
    </div>
    <div v-else>
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
          <tr v-for="tournament in tournaments.tournaments">
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

<script setup lang="ts">
import {USCFMember, USCFMemberTournament} from "~/types/uscf";
import {useLazyFetch} from "#app";

const route = useRoute();
const uscfUserId = route.params.id;

// definePageMeta({
//   title: `US Chess Member: ${useRoute().params.id}`,
//   description: `View the US Chess member profile for ${useRoute().params.id}`
// })

// We can't use NuxtData right now, see https://github.com/nuxt/nuxt/issues/23349
//const { data: uscf } = useNuxtData(`uscf-member-${uscfUserId}`) as { data: USCFMember };

const { data: memberInfo, pending: mPending, error: mError, refresh: mRefresh } = await useLazyFetch(`/api/uscf/member/${uscfUserId}`, {
  key: `uscf-member-${uscfUserId}`,
  // default: () => {
  //   return uscf.value;
  // },
  server: false
}) as { data: USCFMember };

const { data: tournaments, pending: tPending, error: tError, refresh: tRefresh } = await useLazyFetch(`/api/uscf/member/${uscfUserId}/tournaments`, {
  key: `uscf-member-${uscfUserId}-tournaments`,
  server: false
}) as { data: { success: boolean, tournaments: USCFMemberTournament[], page: number, totalPages: number } };
</script>

<style scoped>

</style>
