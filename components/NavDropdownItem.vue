<template>
  <li>
    <NuxtLink :to="href" class="dropdown-item" :target="external ? '_blank' : null">
      <i v-if="faIcon" :class="faIcon" />
      {{ name }}
    </NuxtLink>
  </li>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NavDropdownItem',

  props: {
    name: {
      type: String,
      default: 'Dropdown Item'
    },
    href: {
      type: String,
      default: '#'
    },
    faIcon: {
      type: String,
      default: null
    },
    external: {
      type: Boolean,
      default: false
    }
  }
})
</script>

<style scoped>

</style>
