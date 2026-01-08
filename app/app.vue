<script setup lang="ts">
import { Terminal } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4">
    <div class="border border-terminal-accent p-8 rounded shadow-lg shadow-terminal-accent/20 max-w-2xl w-full">
      <div class="flex items-center gap-2 mb-6 border-b border-terminal-accent/30 pb-4">
        <Terminal class="w-6 h-6 text-terminal-accent" />
        <h1 class="text-2xl font-bold text-terminal-accent tracking-tighter uppercase">
          Trading Journal System <span class="animate-pulse">_</span>
        </h1>
      </div>
      
      <p class="mb-4 leading-relaxed">
        System initialized. Database connection (Google Sheets) pending...
      </p>
      
      <div class="bg-terminal-dark p-4 rounded border border-terminal-gray font-mono text-sm overflow-x-auto">
        <div class="text-terminal-accent">$ nuxi init .</div>
        <div class="text-terminal-text">✔ Nuxt 3 project initialized</div>
        <div class="text-terminal-accent">$ npm install tailwindcss</div>
        <div class="text-terminal-text">✔ Tailwind CSS configured</div>
        <div class="text-terminal-accent">$ ls -F</div>
        <div class="text-terminal-text opacity-70">
          assets/  conductor/  node_modules/  package.json  public/  server/  tsconfig.json ...
        </div>
      </div>
    </div>
  </div>
</template>
