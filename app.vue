<template>
  <NuxtPage />
</template>

<style>
/* Global Terminal Styles */
:root {
  --ui-bg: 5 5 5;
  --ui-surface: 10 10 10;
  --ui-border: 26 26 26;
  --ui-text: 160 160 160;
  --ui-highlight: 255 255 255;
  --ui-accent: 16 185 129;
}

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
