<template>
  <v-tooltip :text="title" location="top">
    <template #activator="{ props }">
      <v-chip v-bind="props" ref="titleElement" variant="flat" color="red" :size="size">
        <b>{{ abbreviation() }}</b>
      </v-chip>
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
    },
    size: {
      type: String,
      default: 'default'
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
      // hard coded
      if (this.title === 'BOT') {
        return 'BOT'
      }

      const title = this.title.replaceAll('Grandmaster', 'Grand Master').split(' ')

      // first letter of every word in the title
      return title.map(word => word[0]).join('')
    }
  }
})
</script>

<style scoped>

</style>
