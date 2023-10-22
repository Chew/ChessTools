<template>
  <NuxtLink :href="href" :target="external ? '_blank' : ''" class="text-grey-darken-3"
            active-class="text-grey-darken-3" exact-active-class="text-grey-darken-3" style="text-decoration: none">
    <v-list-item variant="plain">
      <v-list-item-title>
        <i v-if="faIcon" :class="faIcon" /> {{ name }}
      </v-list-item-title>
    </v-list-item>
  </NuxtLink>
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
