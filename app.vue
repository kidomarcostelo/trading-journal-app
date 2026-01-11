<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  LayoutDashboard, 
  PlusCircle, 
  Settings, 
  FileText, 
  List as ListIcon, 
  RefreshCw, 
  Moon, 
  Sun 
} from 'lucide-vue-next'
import TradeForm from './components/TradeForm.vue'
import TradeList from './components/TradeList.vue'
import PaneNav from './components/PaneNav.vue'

const showForm = ref(false)
const isDark = ref(true)
const activeTab = ref('daily-trades')

// Fetch Trades
const { data: trades, refresh, pending } = await useFetch<any[]>('/api/trades')

const onTradeSuccess = () => {
  showForm.value = false
  refresh()
}

// Theme Logic
const toggleTheme = () => {
  isDark.value = !isDark.value
  updateTheme()
}

const updateTheme = () => {
  if (import.meta.client) {
    const html = document.documentElement
    if (isDark.value) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }
}

onMounted(() => {
  updateTheme()
})
</script>

<template>
  <div class="h-screen flex overflow-hidden bg-terminal-black text-terminal-text font-sans transition-colors duration-300">
    <!-- Pane 1: Navigation Sidebar -->
    <PaneNav 
      v-model:active-tab="activeTab" 
      :is-dark="isDark" 
      @toggle-theme="toggleTheme" 
    />

    <!-- Pane 2: Trade List -->
    <section data-testid="pane-list" class="w-80 border-r border-terminal-gray flex flex-col bg-terminal-black overflow-hidden">
      <div class="p-4 border-b border-terminal-gray flex items-center justify-between">
        <h2 class="font-medium text-terminal-highlight">Trades</h2>
        <div class="flex items-center gap-2">
          <button 
            @click="refresh"
            class="p-1.5 text-terminal-text/60 hover:text-terminal-highlight transition-all"
            :disabled="pending"
          >
            <RefreshCw :class="['w-4 h-4', pending ? 'animate-spin' : '']" />
          </button>
          <button 
            @click="showForm = true"
            class="p-1.5 text-terminal-accent hover:bg-terminal-accent/10 rounded-md transition-all"
          >
            <PlusCircle class="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div class="flex-1 overflow-y-auto">
        <div v-if="pending" class="p-8 text-center">
          <div class="inline-block w-6 h-6 border-2 border-terminal-gray border-t-terminal-accent rounded-full animate-spin"></div>
        </div>
        <TradeList v-else :trades="trades || []" />
      </div>
    </section>

    <!-- Pane 3: Main Detail View -->
    <main data-testid="pane-detail" class="flex-1 bg-terminal-dark overflow-y-auto relative">
      <!-- Form Modal/Overlay -->
      <div v-if="showForm" class="absolute inset-0 z-10 bg-terminal-black/80 backdrop-blur-sm flex items-center justify-center p-6">
        <div class="bg-terminal-dark border border-terminal-gray rounded-xl shadow-2xl w-full max-w-2xl p-6 relative">
          <button @click="showForm = false" class="absolute top-4 right-4 text-terminal-text/40 hover:text-terminal-text">
            <PlusCircle class="w-6 h-6 rotate-45" />
          </button>
          <h2 class="text-xl font-semibold mb-6 text-terminal-highlight">New Trade Entry</h2>
          <TradeForm @success="onTradeSuccess" />
        </div>
      </div>

      <div class="p-8 max-w-4xl mx-auto">
        <div class="text-center py-20 text-terminal-text/40">
          <LayoutDashboard class="w-12 h-12 mx-auto mb-4 opacity-20" />
          <h3 class="text-lg font-medium text-terminal-highlight/60">Select a trade to view details</h3>
          <p class="text-sm">Detailed analysis and editing will appear here.</p>
        </div>
      </div>
    </main>
  </div>
</template>