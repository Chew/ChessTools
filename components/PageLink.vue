<template>
  <NuxtLink :to="href" :class="[underlines ? 'only-hover-td' : 'no-td', `text-${color}`]"
            :active-class="`text-${color}`" :exact-active-class="`text-${color}`">
    <slot v-if="$slots.default" />
    <span v-else>{{ text }}</span>
  </NuxtLink>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PageLink',

  props: {
    href: {
      type: String,
      required: true
    },
    text: {
      type: String,
      default: '',
      required: false
    },
    color: {
      type: String,
      default: 'blue'
    },
    underlines: {
      type: Boolean,
      default: true
    }
  }
})
</script>

<!--suppress CssUnusedSymbol -->
<style scoped>
.no-td, .only-hover-td {
  text-decoration: none;
}

.only-hover-td:hover {
  text-decoration: underline;
}
</style>
