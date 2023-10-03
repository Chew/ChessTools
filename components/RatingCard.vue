<template>
  <v-card class="mb-3" :color="cardColor" :prepend-icon="`mdi-${icon}`">
    <template #title>
      {{ name }} Elo
    </template>
    <v-card-text v-if="data === null">
      <div class="placeholder-glow">
        <span class="placeholder">
          This is just placeholder text.
        </span>
      </div>
    </v-card-text>
    <v-card-text v-else>
      Current:
      <span v-if="data.current.elo == null">
        No rating
      </span>
      <span v-else>
        ({{ data.current.date }}): {{ data.current.elo }} ({{ data.current.games }} games)
      </span>
      <span v-if="data.current.elo != data.future.elo">
        <br>
        Future ({{ data.future.date }}): {{ data.future.elo }} ({{ data.future.games }} games)
      </span>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { USCFMemberRating } from '~/types/uscf'

export default defineComponent({
  name: 'RatingCard',

  props: {
    data: {
      type: Object as () => USCFMemberRating | null,
      required: true,
      default: null
    },
    name: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: null
    },
    cardColor: {
      type: String,
      default: 'blue'
    },
    placeholder: {
      type: Boolean,
      default: false
    }
  }
})
</script>

<style scoped>

</style>
