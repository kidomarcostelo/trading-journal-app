<script setup lang="ts">
import { watch } from 'vue'

const colorMode = useColorMode()

// Force class application as a backup for production environments
watch(() => colorMode.value, (newMode) => {
  if (import.meta.client) {
    const html = document.documentElement
    if (newMode === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }
}, { immediate: true })

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
