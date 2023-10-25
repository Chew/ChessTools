<template>
  <PageLink :href="href" :target="external ? '_blank' : ''" :color="`grey-${theme}en-3`" :underlines="false">
    <v-list-item variant="plain">
      <v-list-item-title>
        <i v-if="faIcon" :class="faIcon" /> {{ name }}
      </v-list-item-title>
    </v-list-item>
  </PageLink>
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
    },
    theme: {
      type: String,
      default: 'light'
    }
  }
})
</script>

<style scoped>

</style>
