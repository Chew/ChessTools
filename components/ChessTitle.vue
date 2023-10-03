<template>
  <v-tooltip :text="title" location="top">
    <template #activator="{ props }">
      <span v-bind="props" ref="titleElement" class="badge text-bg-danger title-badge" data-bs-toggle="tooltip" :title="title">{{ abbreviation() }}</span>
    </template>
  </v-tooltip>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
// import Tooltip from 'bootstrap/js/dist/tooltip'

export default defineComponent({
  name: 'ChessTitle',

  props: {
    title: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      tooltip: null // as Tooltip | null
    }
  },

  mounted() {
    // this.tooltip = new Tooltip(this.$refs.titleElement as Element)
  },

  methods: {
    abbreviation() {
      const title = this.title.replaceAll('Grandmaster', 'Grand Master').split(' ')

      // first letter of every word in the title
      return title.map(word => word[0]).join('')
    }
  }
})
</script>

<style scoped>
.title-badge {
  padding: 0.15em 0.3em!important;
}
</style>
