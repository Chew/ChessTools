<template>
  <li class="nav-item dropdown">
    <a :id="buildId()" class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
       aria-expanded="false">
      <i v-if="faIcon" :class="faIcon" />
      {{ name }}
    </a>
    <ul class="dropdown-menu" :aria-labelledby="buildId()">
      <slot />
    </ul>
  </li>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NavDropdown',

  props: {
    name: {
      type: String,
      default: 'Dropdown'
    },
    faIcon: {
      type: String,
      default: null
    }
  },

  methods: {
    buildId() {
      return `${this.parameterize()}-dropdown`
    },

    parameterize() {
      // lowercase, remove symbols, replace spaces with dashes
      return this.name.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/ /g, '-')
    }
  }
})
</script>

<style scoped>

</style>
