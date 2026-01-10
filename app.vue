<script setup lang="ts">
import { ref } from 'vue'
import { Terminal, PlusCircle, LayoutGrid, List as ListIcon, RefreshCw } from 'lucide-vue-next'
import TradeForm from './components/TradeForm.vue'
import TradeList from './components/TradeList.vue'
import TradeGallery from './components/TradeGallery.vue'

const showForm = ref(false)
const viewMode = ref<'gallery' | 'list'>('gallery')

// Fetch Trades
const { data: trades, refresh, pending } = await useFetch<any[]>('/api/trades')

const onTradeSuccess = () => {
  showForm.value = false
  refresh()
}
</script>

<template>
  <div class="min-h-screen bg-terminal-black text-terminal-text font-mono p-4 md:p-8">
    <!-- Header -->
    <header class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-terminal-gray pb-6 gap-4">
      <div class="flex items-center gap-3">
        <Terminal class="w-8 h-8 text-terminal-accent" />
        <div>
          <h1 class="text-2xl font-bold text-terminal-accent uppercase tracking-tighter">
            Trading Journal System <span class="animate-pulse">_</span>
          </h1>
          <p class="text-[10px] text-terminal-text/40 uppercase tracking-widest">Version 1.0.0 // DB: Google Sheets // Connection: Active</p>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <!-- View Toggle -->
        <div v-if="!showForm" class="flex bg-terminal-dark border border-terminal-gray p-1 rounded">
          <button 
            @click="viewMode = 'gallery'"
            :class="['p-2 rounded transition-all', viewMode === 'gallery' ? 'bg-terminal-accent text-terminal-black' : 'text-terminal-text/50 hover:text-terminal-accent']"
            title="Gallery View"
          >
            <LayoutGrid class="w-4 h-4" />
          </button>
          <button 
            @click="viewMode = 'list'"
            :class="['p-2 rounded transition-all', viewMode === 'list' ? 'bg-terminal-accent text-terminal-black' : 'text-terminal-text/50 hover:text-terminal-accent']"
            title="List View"
          >
            <ListIcon class="w-4 h-4" />
          </button>
        </div>

        <button 
          @click="refresh"
          class="p-2 text-terminal-text/50 hover:text-terminal-accent border border-terminal-gray rounded hover:border-terminal-accent/30 transition-all"
          :disabled="pending"
        >
          <RefreshCw :class="['w-4 h-4', pending ? 'animate-spin' : '']" />
        </button>

        <button 
          @click="showForm = !showForm"
          class="flex items-center gap-2 bg-terminal-accent/10 border border-terminal-accent text-terminal-accent px-4 py-2 hover:bg-terminal-accent hover:text-terminal-black transition-all uppercase text-sm font-bold tracking-widest"
        >
          <PlusCircle class="w-4 h-4" />
          {{ showForm ? 'Close Entry' : 'New Trade' }}
        </button>
      </div>
    </header>

    <main class="max-w-7xl mx-auto">
      <!-- Form View -->
      <div v-if="showForm" class="mb-12 max-w-4xl mx-auto">
        <TradeForm @success="onTradeSuccess" />
      </div>

      <!-- Dashboard View -->
      <div v-else>
        <div v-if="pending" class="py-20 text-center">
          <div class="inline-block w-8 h-8 border-4 border-terminal-accent border-t-transparent rounded-full animate-spin"></div>
          <p class="mt-4 text-terminal-accent animate-pulse uppercase text-xs tracking-widest">Fetching data from core...</p>
        </div>
        
        <div v-else>
          <!-- Summary Bar (Optional) -->
          <div class="flex items-center gap-4 mb-6 text-[10px] uppercase tracking-widest text-terminal-text/30">
             <span>Total Records: {{ trades?.length || 0 }}</span>
             <span class="w-1 h-1 bg-terminal-gray rounded-full"></span>
             <span>System: Operational</span>
          </div>

          <!-- Gallery -->
          <TradeGallery v-if="viewMode === 'gallery'" :trades="trades || []" />
          
          <!-- List -->
          <TradeList v-else :trades="trades || []" />
        </div>
      </div>
    </main>
    
    <!-- Footer -->
    <footer class="max-w-7xl mx-auto mt-20 pt-8 border-t border-terminal-gray text-[10px] text-terminal-text/20 uppercase tracking-[0.2em] flex justify-between">
      <span>&copy; 2026 Trading Journal Corp</span>
      <span>Secured via G-Auth</span>
    </footer>
  </div>
</template>