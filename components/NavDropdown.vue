<template>
  <v-menu color="grey-lighten-3">
    <template #activator="{ props }">
      <v-btn color="grey-lighten-3" v-bind="props">
        <i v-if="faIcon" :class="faIcon" />&nbsp;{{ name }}
      </v-btn>
    </template>
    <v-list>
      <slot />
    </v-list>
  </v-menu>
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
