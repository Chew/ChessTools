<template>
  <main>
    <h1>Welcome to Chess.Tools</h1>

    <p>Chess.Tools is a free, open-source chess website with a focus on tools for chess players and organizers.</p>

    <h2>Features</h2>
    <v-row>
      <v-col cols="12" md="6">
        <v-card title="Game Scorecard" subtitle="Record your games!" color="red-lighten-3">
          <v-card-text>
            Chess.Tools has a way to record your OTB chess games!
            Simply head on over to <page-link href="/game/new" text="the new game page" color="blue-darken-2" /> and start playing moves!
            Save them to your profile once you're done.
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card title="Link Your Platforms" subtitle="Link Chess.com, Lichess, even US Chess and FIDE!" color="blue-lighten-3">
          <v-card-text>
            Chess.Tools lets you link all your accounts across chess websites and federations.
            With Chess websites, you can import your games and view them here.
            For federations, link your tournament games and view your rating history!
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <h2 v-if="showStats">
      Stats
    </h2>
    <v-row v-if="showStats">
      <v-col cols="12" md="6">
        <v-card title="Games" subtitle="Amount of games in our database!" :text="games.toString()" color="orange-lighten-3" />
      </v-col>
      <v-col cols="12" md="6">
        <v-card title="Users" subtitle="Amount of users in our database!" :text="users.toString()" color="green-lighten-3" />
      </v-col>
    </v-row>
  </main>
</template>

<script>
export default defineComponent({
  name: 'index',

  data() {
    return {
      games: 0,
      users: 0,
      showStats: false
    }
  }
})
</script>

<style>

</style>
