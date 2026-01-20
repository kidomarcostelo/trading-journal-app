<script setup lang="ts">
useHead({
  bodyAttrs: {
    class: 'bg-terminal-black text-terminal-text font-sans transition-colors duration-300'
  }
})
</script>

<template>
  <NuxtPage />
</template>

<style>
/* Global Terminal Styles */
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #1a1a1a;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #2a2a2a;
}
</style>
