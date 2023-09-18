<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a href="/" class="navbar-brand">Chess Tools</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarText">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <navbar-item name="Home" href="/" :current-path="useRoute().path" />
          </ul>
        </div>
      </div>
    </nav>
    <div class="container move-container">
      <div class="p-4 bg-body-tertiary rounded-3">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NavbarItem from "~/components/NavbarItem.vue";
</script>

<style>
body {
  background-color: #b98761;
}
</style>
