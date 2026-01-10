<script setup lang="ts">
import { ref } from 'vue'
import { Terminal, PlusCircle } from 'lucide-vue-next'
const showForm = ref(false)
</script>

<template>
  <div class="min-h-screen bg-terminal-black text-terminal-text font-mono p-4 md:p-8">
    <header class="max-w-7xl mx-auto flex items-center justify-between mb-8 border-b border-terminal-gray pb-6">
      <div class="flex items-center gap-3">
        <Terminal class="w-8 h-8 text-terminal-accent" />
        <div>
          <h1 class="text-2xl font-bold text-terminal-accent uppercase tracking-tighter">
            Trading Journal System <span class="animate-pulse">_</span>
          </h1>
          <p class="text-[10px] text-terminal-text/40 uppercase tracking-widest">Version 1.0.0 // Connection: Active</p>
        </div>
      </div>

      <button 
        @click="showForm = !showForm"
        class="flex items-center gap-2 bg-terminal-accent/10 border border-terminal-accent text-terminal-accent px-4 py-2 hover:bg-terminal-accent hover:text-terminal-black transition-all uppercase text-sm font-bold tracking-widest"
      >
        <PlusCircle class="w-4 h-4" />
        {{ showForm ? 'Close Entry' : 'New Trade' }}
      </button>
    </header>

    <main class="max-w-7xl mx-auto">
      <div v-if="showForm" class="mb-12">
        <TradeForm @success="showForm = false" />
      </div>

      <div v-else class="text-center py-20 border border-dashed border-terminal-gray rounded">
        <p class="text-terminal-text/50 italic mb-4">No active dashboard views. Select a function to begin.</p>
        <button @click="showForm = true" class="text-terminal-accent hover:underline uppercase text-xs tracking-widest font-bold">
          [ Initiate New Trade Entry ]
        </button>
      </div>
    </main>
  </div>
</template>

