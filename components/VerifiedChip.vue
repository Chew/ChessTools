<template>
  <v-chip v-if="verified" color="green" prepend-icon="mdi-check-circle" text-color="white">
    Verified
  </v-chip>
  <v-chip v-else color="red" prepend-icon="mdi-alert-circle" text-color="white">
    Unverified
  </v-chip>
</template>

<script>
export default {
  name: 'VerifiedChip',

  props: {
    verified: {
      type: Boolean,
      required: true
    }
  }
}
</script>

<style scoped>
/* Your component's scoped styles here */
</style>
