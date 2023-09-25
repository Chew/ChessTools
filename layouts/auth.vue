<template>
  <div id="mainBody" class="d-flex align-items-center py-4 bg-body-tertiary">
    <main class="form-signin w-100 m-auto">
      <slot />
    </main>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: "auth"
})
</script>

<style>
@import '@/assets/auth.css';

#mainBody, body, html, #__nuxt, #__layout {
  height: 100%!important;
}
</style>
