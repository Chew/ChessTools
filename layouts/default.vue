<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a href="/" class="navbar-brand">Chess Tools</a>
<!--        <%= link_to "Utilities", "#", class: "navbar-brand" %>-->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarText">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <navbar-item name="Home" href="/" :current-path="useRoute().path" />
<!--            <%= navbar_item name: "HTML to Text", href: "/util/html", fa_icon: "fas fa-code" %>-->
<!--            <%= navbar_item name: "Random String", href: "/util/random", fa_icon: "fas fa-random" %>-->
<!--            <%= navbar_item name: "Wordle Solver", href: "/util/wordle", fa_icon: "fas fa-plus-circle" %>-->
<!--            <%= navbar_item name: "Base Converter", href: "/util/bases", fa_icon: "fas fa-cubes" %>-->
          </ul>

<!--          <%= render "/layouts/navs/chew" %>-->
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
