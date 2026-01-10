<script setup lang="ts">
import { ref } from 'vue'
import { LayoutDashboard, PlusCircle, LayoutGrid, List as ListIcon, RefreshCw } from 'lucide-vue-next'
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
  <div class="min-h-screen bg-terminal-black text-terminal-text font-sans p-6 md:p-10">
    <!-- Header -->
    <header class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-terminal-dark border border-terminal-gray rounded-lg shadow-sm">
          <LayoutDashboard class="w-6 h-6 text-terminal-accent" />
        </div>
        <div>
          <h1 class="text-xl font-semibold text-terminal-highlight tracking-tight">
            Trading Journal
          </h1>
          <p class="text-xs text-terminal-text/60">Overview</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- View Toggle -->
        <div v-if="!showForm" class="flex bg-terminal-dark border border-terminal-gray p-1 rounded-lg shadow-sm">
          <button 
            @click="viewMode = 'gallery'"
            :class="['p-2 rounded-md transition-all', viewMode === 'gallery' ? 'bg-terminal-gray text-terminal-highlight shadow-sm' : 'text-terminal-text/60 hover:text-terminal-text']"
            title="Gallery View"
          >
            <LayoutGrid class="w-4 h-4" />
          </button>
          <button 
            @click="viewMode = 'list'"
            :class="['p-2 rounded-md transition-all', viewMode === 'list' ? 'bg-terminal-gray text-terminal-highlight shadow-sm' : 'text-terminal-text/60 hover:text-terminal-text']"
            title="List View"
          >
            <ListIcon class="w-4 h-4" />
          </button>
        </div>

        <button 
          @click="refresh"
          class="p-2.5 text-terminal-text/60 hover:text-terminal-highlight bg-terminal-dark border border-terminal-gray rounded-lg hover:border-terminal-text/30 transition-all shadow-sm"
          :disabled="pending"
          title="Refresh Data"
        >
          <RefreshCw :class="['w-4 h-4', pending ? 'animate-spin' : '']" />
        </button>

        <button 
          @click="showForm = !showForm"
          class="flex items-center gap-2 bg-terminal-accent hover:bg-terminal-accent/90 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-terminal-accent/20 transition-all text-sm font-medium"
        >
          <PlusCircle class="w-4 h-4" />
          {{ showForm ? 'Cancel Entry' : 'New Trade' }}
        </button>
      </div>
    </header>

    <main class="max-w-7xl mx-auto">
      <!-- Form View -->
      <div v-if="showForm" class="mb-12 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
        <TradeForm @success="onTradeSuccess" />
      </div>

      <!-- Dashboard View -->
      <div v-else>
        <div v-if="pending" class="py-32 text-center">
          <div class="inline-block w-8 h-8 border-2 border-terminal-gray border-t-terminal-accent rounded-full animate-spin"></div>
          <p class="mt-4 text-terminal-text/40 text-sm">Loading data...</p>
        </div>
        
        <div v-else class="animate-in fade-in duration-500">
          <!-- Summary Bar -->
          <div class="flex items-center justify-between mb-6 px-1">
             <span class="text-sm text-terminal-text/60 font-medium">Total Records: <span class="text-terminal-highlight font-mono">{{ trades?.length || 0 }}</span></span>
          </div>

          <!-- Gallery -->
          <TradeGallery v-if="viewMode === 'gallery'" :trades="trades || []" />
          
          <!-- List -->
          <TradeList v-else :trades="trades || []" />
        </div>
      </div>
    </main>
    
    <!-- Footer -->
    <footer class="max-w-7xl mx-auto mt-24 pt-8 border-t border-terminal-gray/50 text-xs text-terminal-text/30 flex justify-between">
      <span>&copy; 2026 Trading Journal</span>
      <span>Connected to Google Sheets</span>
    </footer>
  </div>
</template>
