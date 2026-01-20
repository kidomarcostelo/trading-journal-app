<template>
  <NuxtPage />
</template>

<style>
/* Global Terminal Styles */
:root {
  --color-terminal-black: #050505;
  --color-terminal-dark: #0a0a0a;
  --color-terminal-gray: #1a1a1a;
  --color-terminal-text: #a0a0a0;
  --color-terminal-highlight: #ffffff;
  --color-terminal-accent: #10b981; /* Emerald-500 */
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
