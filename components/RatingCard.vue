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
      Published:
      <span v-if="data.current.elo == null">
        No rating
      </span>
      <span v-else>
        ({{ data.current.date }}): {{ data.current.elo }}
        <span v-if="data.current.games">({{ data.current.games }} games)</span>
        <span v-else-if="data.current.floor">(floor: {{ data.current.floor }})</span>
      </span>
      <span v-if="data.future && data.future.elo !== data.current.elo">
        <br>
        Future:
        ({{ data.future.date }}): {{ data.future.elo }}
        <span v-if="data.future.games">({{ data.future.games }} games)</span>
      </span>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { USCFMemberRating } from '~/types/uscf'

export default defineComponent({
  name: 'RatingCard',

  props: {
    data: {
      type: Object as () => USCFMemberRating | null,
      required: false,
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
