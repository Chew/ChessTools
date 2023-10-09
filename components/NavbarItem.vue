<template>
  <li :class="['nav-item', isCurrentPath() ? 'disabled active' : '']">
    <NuxtLink :class="['nav-link', isCurrentPath() ? 'active disabled': '']" :href="href" :target="external ? '_blank' : ''">
      <i v-if="faIcon" :class="['fa', faIcon]" /> {{ name }}
    </NuxtLink>
  </li>
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
