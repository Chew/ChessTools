<template>
  <header v-if="pending">
    <h1>US Chess Member: Loading...</h1>
  </header>
  <header v-else>
    <h1>US Chess Member: {{ data.member.name }}</h1>
    <p>Member ID: {{ data.member.id }}</p>
    <p><a :href="`https://www.uschess.org/msa/MbrDtlMain.php?${data.member.id}`">View on USChess MSA</a></p>
  </header>

  <main v-if="pending">
    <p>Please wait, we're retrieving their data :)</p>
  </main>
  <main v-else>
    <h2>Member Info</h2>
    <p>
      State: {{ data.state }}<br/>
      Gender: {{ data.gender }}<br/>
      <span v-if="data.fide.id">
        FIDE ID: {{ data.fide.id }} ({{ data.fide.country }})<br/>
      </span>
    </p>
    <h2>Ratings</h2>
    <div class="row">
      <div class="col-md-4 col-sm-12">
        <rating-card name="Regular" :data="data.ratings.regular" fa-icon="fas fa-stopwatch"></rating-card>
      </div>
      <div class="col-md-4 col-sm-12">
        <rating-card name="Quick" :data="data.ratings.quick" fa-icon="fas fa-bolt"></rating-card>
      </div>
      <div class="col-md-4 col-sm-12">
        <rating-card name="Blitz" :data="data.ratings.blitz" fa-icon="fas fa-forward-fast"></rating-card>
      </div>
    </div>
    <div class="row">
      <div class="col-md-4 col-sm-12">
        <rating-card name="Regular" :data="data.ratings.online_regular" fa-icon="fas fa-stopwatch" card-color="success"></rating-card>
      </div>
      <div class="col-md-4 col-sm-12">
        <rating-card name="Quick" :data="data.ratings.online_quick" fa-icon="fas fa-bolt" card-color="success"></rating-card>
      </div>
      <div class="col-md-4 col-sm-12">
        <rating-card name="Blitz" :data="data.ratings.online_blitz" fa-icon="fas fa-forward-fast" card-color="success"></rating-card>
      </div>
    </div>
    <h2>Tournament History</h2>
    <p>Coming Soon!</p>
  </main>
</template>

<script setup lang="ts">
import {USCFMember} from "~/types/uscf";
import {useLazyFetch} from "#app";

const route = useRoute();
const uscfUserId = route.params.id;

// definePageMeta({
//   title: `US Chess Member: ${useRoute().params.id}`,
//   description: `View the US Chess member profile for ${useRoute().params.id}`
// })

// We can't use NuxtData right now, see https://github.com/nuxt/nuxt/issues/23349
//const { data: uscf } = useNuxtData(`uscf-member-${uscfUserId}`) as { data: USCFMember };

const { data, pending, error, refresh } = await useLazyFetch(`/api/uscf/member/${uscfUserId}`, {
  key: `uscf-member-${uscfUserId}`,
  // default: () => {
  //   return uscf.value;
  // },
  server: false
}) as { data: USCFMember };
</script>

<style scoped>

</style>
