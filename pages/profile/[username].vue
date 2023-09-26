<template>
  <main>
    <h1>Profile for {{ user.username }}</h1>
    <p>{{ user.bio }}</p>
  </main>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {useFetch} from "#app";
import {TableUser} from "~/types/supabase";

export default defineComponent({
  name: "[username]",

  setup() {
    const username = useRoute().params.username;

    const {data: userData} = useFetch("/api/users/" + username);

    // set data for the page
    return {
      user: (userData.value as { success: boolean, data: TableUser }).data
    }
  },
})
</script>

<style scoped>

</style>
