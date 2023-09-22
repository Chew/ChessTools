<template>
  <div :class="`card text-bg-${cardColor} mb-3`">
    <div class="row g-0">
      <div class="col-md-2">
        <div class="card-body h-100">
          <i :class="`${faIcon} fa-3x`"></i>
        </div>
      </div>
      <div class="col-md-10">
        <div class="card-body">
          <h5 class="card-title">{{ name }} Elo</h5>
          <p class="card-text">
            Current:
            <span v-if="data.current.elo == null">
              No rating
            </span>
            <span v-else>
              ({{ data.current.date }}): {{ data.current.elo }} ({{ data.current.games }} games)
            </span>
            <span v-if="data.current.elo != data.future.elo">
              <br>
              Future ({{ data.future.date }}): {{ data.future.elo }} ({{data.future.games }} games)
            </span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {USCFMemberRating} from "~/types/uscf";

export default defineComponent({
  name: "RatingCard",

  props: {
    data: {
      type: Object as () => USCFMemberRating,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    faIcon: {
      type: String,
      default: null
    },
    cardColor: {
      type: String,
      default: "primary"
    }
  }
})
</script>

<style scoped>

</style>
