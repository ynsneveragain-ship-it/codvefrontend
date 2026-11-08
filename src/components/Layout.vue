<template>
  <div class="min-h-screen bg-gray-100">
    <NavBar />
    <main class="max-w-7xl mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
import NavBar from './NavBar.vue';
</script>
