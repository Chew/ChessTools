<template>
  <NuxtLink :href="href" :target="external ? '_blank' : ''">
    <v-btn :link="true" :variant="isCurrentPath() ? 'tonal' : 'text'" color="grey-darken-3">
      <i v-if="faIcon" :class="faIcon" /> {{ name }}
    </v-btn>
  </NuxtLink>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NavbarItem',

  props: {
    name: {
      type: String,
      default: 'Item'
    },
    href: {
      type: String,
      default: '/'
    },
    faIcon: {
      type: String,
      default: null
    },
    external: {
      type: Boolean,
      default: false
    },
    currentPath: {
      type: String,
      default: null
    }
  },

  methods: {
    isCurrentPath() {
      return this.currentPath === this.href
    }
  }
})
</script>

<style scoped>

</style>
