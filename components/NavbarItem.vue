<template>
  <li :class="['nav-item', isCurrentPath() ? 'disabled active' : '']">
    <a :class="['nav-link', isCurrentPath() ? 'active disabled': '']" :href="href" :target="external ? '_blank' : ''">
      <i v-if="faIcon" :class="['fa', faIcon, 'me-2']"></i>
      {{ name }}
    </a>
  </li>
</template>

<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: "NavbarItem",

  props: {
    name: String,
    href: String,
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
      return this.currentPath == this.href;
    }
  }
})
</script>

<style scoped>

</style>
