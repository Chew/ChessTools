<template>
  <main v-if="error">
    {{ message }}
  </main>
  <main v-else-if="user">
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

    const {data: userData, error: userError} = useFetch<{ success: boolean }>("/api/users/" + username);
    const userDataValue = userData.value;

    if (userDataValue == null) {
      return {
        error: true,
        message: "Error loading user data: " + userError?.value || "Unknown error",
        user: null,
      }
    }

    if (userDataValue.success == false) {
      return {
        error: true,
        message: "User not found",
        user: null,
      }
    }

    // set data for the page
    return {
      error: false,
      message: "",
      user: (userData.value as { success: boolean, data: TableUser }).data
    }
  },
})
</script>

<style scoped>

</style>
