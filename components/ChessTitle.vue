<template>
  <span ref="titleElement" class="badge text-bg-danger title-badge" data-bs-toggle="tooltip" :title="title">{{ abbreviation() }}</span>
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
      let title = this.title.split(' ')

      // edge cases
      if (title.includes('Grandmaster')) {
        // make it "Grand Master" for the purposes of abbreviation
        title = title.map(word => word === 'Grandmaster' ? 'Grand Master' : word)
      }

      // first letter of every word in the title
      return this.title.split(' ').map(word => word[0]).join('')
    }
  }
})
</script>

<style scoped>
.title-badge {
  padding: 0.15em 0.3em!important;
}
</style>
