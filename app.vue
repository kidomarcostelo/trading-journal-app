<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { 
  LayoutDashboard, 
  PlusCircle, 
  Settings, 
  FileText, 
  List as ListIcon, 
  RefreshCw, 
  Moon, 
  Sun,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  ArrowUp,
  ArrowDown
} from 'lucide-vue-next'
import TradeForm from './components/TradeForm.vue'
import TradeList from './components/TradeList.vue'
import TradeDataTable from './components/TradeDataTable.vue'
import TradeStats from './components/TradeStats.vue'
import PaneNav from './components/PaneNav.vue'
import StrategyAccordion from './components/StrategyAccordion.vue'
import type { ChipCategory } from './types'

const showForm = ref(false)
const isDark = ref(true)
const activeTab = ref('daily-trades')
const selectedTradeId = ref<string | null>(null)

// Fetch Trades & Config
const { data: trades, refresh, pending } = await useFetch<any[]>('/api/trades')
const { data: config } = await useFetch<ChipCategory[]>('/api/config')

// Unified Trade Logic
import { useTrades } from './composables/useTrades'
const { 
  filterPeriod, 
  sortBy, 
  sortDir, 
  filteredTrades 
} = useTrades(computed(() => trades.value || []))

const activeTrade = computed(() => {
  return filteredTrades.value.find(t => (t.ID || t.id) === selectedTradeId.value)
})

const handleTradeUpdate = async (updatedFields: any) => {
  if (!activeTrade.value || !trades.value) return
  
  // Update local state immediately for responsiveness
  const index = trades.value.findIndex(t => (t.ID || t.id) === selectedTradeId.value)
  if (index !== -1) {
    const updatedTrade = { ...trades.value[index], ...updatedFields }
    trades.value[index] = updatedTrade

    // Persist to backend
    try {
      await $fetch('/api/trades', {
        method: 'PUT',
        body: { 
          ID: selectedTradeId.value, // Ensure ID is sent
          ...updatedFields 
        }
      })
    } catch (err) {
      console.error('Failed to auto-save trade:', err)
    }
  }
}

const toggleSortDir = () => {
  sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
}

const onTradeSuccess = () => {
  showForm.value = false
  refresh()
}

// Pane Resizing Logic
const sidebarWidth = ref(256) // default w-64
const lastSidebarWidth = ref(256)
const listWidth = ref(320)    // default w-80
const lastListWidth = ref(320)
const isResizing = ref<'sidebar' | 'list' | null>(null)

const isSidebarCollapsed = computed(() => sidebarWidth.value < 100)
const isListCollapsed = computed(() => listWidth.value <= 100)

const startResize = (pane: 'sidebar' | 'list') => {
  isResizing.value = pane
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const doResize = (e: MouseEvent) => {
  if (!isResizing.value) return

  if (isResizing.value === 'sidebar') {
    let newWidth = Math.min(e.clientX, 400)
    if (newWidth < 150) {
      newWidth = 64
    } else {
      lastSidebarWidth.value = newWidth
    }
    sidebarWidth.value = newWidth
  } else if (isResizing.value === 'list') {
    const newWidth = Math.max(100, Math.min(e.clientX - sidebarWidth.value, 600))
    listWidth.value = newWidth
    if (newWidth > 100) {
        lastListWidth.value = newWidth
    }
  }
}

const stopResize = () => {
  isResizing.value = null
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

const toggleListCollapse = () => {
  if (isListCollapsed.value) {
    listWidth.value = Math.max(320, lastListWidth.value)
  } else {
    lastListWidth.value = listWidth.value
    listWidth.value = 100
  }
}

const toggleSidebar = () => {
  if (isSidebarCollapsed.value) {
    sidebarWidth.value = Math.max(256, lastSidebarWidth.value)
  } else {
    lastSidebarWidth.value = sidebarWidth.value
    sidebarWidth.value = 64
  }
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
  window.addEventListener('mousemove', doResize)
  window.addEventListener('mouseup', stopResize)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', doResize)
  window.removeEventListener('mouseup', stopResize)
})
</script>

<template>
  <div class="h-screen flex overflow-hidden bg-terminal-black text-terminal-text font-sans transition-colors duration-300">
    <!-- Pane 1: Navigation Sidebar -->
    <div 
      :style="{ width: `${sidebarWidth}px` }" 
      class="flex-shrink-0 relative transition-[width] duration-0 ease-linear overflow-hidden"
    >
      <PaneNav 
        v-model:active-tab="activeTab" 
        :is-dark="isDark" 
        :collapsed="isSidebarCollapsed"
        @toggle-theme="toggleTheme" 
        @toggle-collapse="toggleSidebar"
      />
    </div>

    <!-- Handle 1 -->
    <div 
      @mousedown.prevent="startResize('sidebar')"
      class="w-1 h-full cursor-col-resize hover:bg-terminal-accent/50 transition-colors z-20 flex-shrink-0 bg-terminal-gray/10"
    ></div>

    <!-- Pane 2: Trade List -->
    <section 
      data-testid="pane-list" 
      :style="{ width: `${listWidth}px` }"
      class="flex-shrink-0 border-r border-terminal-gray flex flex-col bg-terminal-black overflow-hidden relative transition-[width] duration-100 ease-in-out"
    >
      <div class="p-4 border-b border-terminal-gray flex flex-col gap-3 bg-terminal-black">
        <div class="flex items-center justify-between">
          <h2 class="font-medium text-terminal-highlight truncate">Trades</h2>
          <div class="flex items-center gap-1">
            <button 
              @click="toggleListCollapse"
              class="p-1.5 text-terminal-text/60 hover:text-terminal-highlight transition-all"
              :title="isListCollapsed ? 'Expand List' : 'Collapse to Pair only'"
            >
              <ChevronsRight v-if="isListCollapsed" class="w-4 h-4" />
              <ChevronsLeft v-else class="w-4 h-4" />
            </button>
            <button 
              v-if="!isListCollapsed"
              @click="() => refresh()"
              class="p-1.5 text-terminal-text/60 hover:text-terminal-highlight transition-all"
              :disabled="pending"
            >
              <RefreshCw :class="['w-4 h-4', pending ? 'animate-spin' : '']" />
            </button>
            <button 
               v-if="!isListCollapsed"
              @click="showForm = true"
              class="p-1.5 text-terminal-accent hover:bg-terminal-accent/10 rounded-md transition-all"
            >
              <PlusCircle class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Filter & Sort Controls (Hidden if collapsed) -->
        <div v-if="!isListCollapsed" class="flex items-center gap-2">
           <div class="relative flex-1">
             <select 
               v-model="filterPeriod"
               class="w-full appearance-none bg-terminal-black border border-terminal-gray/30 rounded px-2 py-1 text-xs text-terminal-text hover:border-terminal-gray/50 focus:border-terminal-accent focus:outline-none transition-colors cursor-pointer"
             >
               <option value="all">All Time</option>
               <option value="week">This Week</option>
               <option value="last-week">Last Week</option>
               <option value="month">This Month</option>
               <option value="last-month">Last Month</option>
             </select>
             <Filter class="w-3 h-3 absolute right-2 top-1.5 text-terminal-text/40 pointer-events-none" />
           </div>

           <div class="relative flex-1 group">
             <select 
               v-model="sortBy"
               class="w-full appearance-none bg-terminal-black border border-terminal-gray/30 rounded px-2 py-1 text-xs text-terminal-text hover:border-terminal-gray/50 focus:border-terminal-accent focus:outline-none transition-colors cursor-pointer"
             >
               <option value="Date">Date</option>
               <option value="Status">Status</option>
               <option value="Pair">Pair</option>
             </select>
             <button 
               @click="toggleSortDir"
               class="absolute right-1 top-1 p-0.5 hover:bg-terminal-gray/20 rounded cursor-pointer z-10 group/sort"
               title="Toggle Sort Order"
             >
               <ArrowUp v-if="sortDir === 'asc'" class="w-3 h-3 text-terminal-text/60 group-hover/sort:text-terminal-highlight transition-colors" />
               <ArrowDown v-else class="w-3 h-3 text-terminal-text/60 group-hover/sort:text-terminal-highlight transition-colors" />
             </button>
           </div>
        </div>
      </div>
      
      <div class="flex-1 overflow-y-auto overflow-x-hidden">
        <div v-if="pending" class="p-8 text-center">
          <div class="inline-block w-6 h-6 border-2 border-terminal-gray border-t-terminal-accent rounded-full animate-spin"></div>
        </div>
        <TradeList 
          v-else 
          :trades="trades || []" 
          :active-id="selectedTradeId"
          :collapsed="isListCollapsed"
          :filter-period="filterPeriod"
          :sort-by="sortBy"
          :sort-dir="sortDir"
          @select="selectedTradeId = $event"
        />
      </div>
    </section>

    <!-- Handle 2 -->
    <div 
      @mousedown.prevent="startResize('list')"
      class="w-1 h-full cursor-col-resize hover:bg-terminal-accent/50 transition-colors z-20 flex-shrink-0 bg-terminal-gray/10"
    ></div>

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

      <div v-if="activeTrade" class="p-8 max-w-4xl mx-auto">
        <div class="mb-8">
           <div class="flex items-center justify-between mb-2">
             <h1 class="text-2xl font-bold text-terminal-highlight">{{ activeTrade.Pair }}</h1>
             <!-- Badges -->
             <div class="flex gap-2">
               <span v-if="activeTrade.Flags?.includes('HTF FAV')" class="px-2 py-0.5 rounded bg-terminal-accent/20 text-terminal-accent text-[10px] font-bold uppercase border border-terminal-accent/30">HTF FAV</span>
               <span v-for="badge in (activeTrade.Badges || '').split(',').filter(Boolean)" :key="badge" class="px-2 py-0.5 rounded bg-terminal-gray/20 text-terminal-text text-[10px] font-bold uppercase border border-terminal-gray/30">{{ badge }}</span>
             </div>
           </div>
           <div class="flex items-center gap-3 text-sm text-terminal-text/60">
             <span class="bg-terminal-gray/20 px-2 py-0.5 rounded">{{ activeTrade.Market }}</span>
             <span>{{ activeTrade.Date }}</span>
             <span :class="activeTrade.Status === 'Open' ? 'text-emerald-400' : ''">{{ activeTrade.Status }}</span>
           </div>
        </div>

        <!-- Filtered Stats -->
        <div class="mb-8">
          <TradeStats :trades="filteredTrades" />
        </div>
        
        <!-- Phase 3 components -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div class="bg-terminal-black/30 border border-terminal-gray p-6 rounded-lg">
             <h3 class="font-medium text-terminal-highlight mb-4">Trade Data</h3>
             <TradeDataTable :trade="activeTrade" @update="handleTradeUpdate" />
           </div>
           
           <div class="bg-terminal-black/30 border border-terminal-gray p-6 rounded-lg">
             <h3 class="font-medium text-terminal-highlight mb-4">Strategy</h3>
             <StrategyAccordion 
               v-if="config" 
               :config="config" 
               :modelValue="activeTrade" 
               @update:modelValue="handleTradeUpdate" 
             />
             <div v-else class="text-sm text-terminal-text/60 animate-pulse">Loading strategies...</div>
           </div>
        </div>
      </div>

      <div v-else class="p-8 max-w-4xl mx-auto">
        <div class="text-center py-20 text-terminal-text/40">
          <LayoutDashboard class="w-12 h-12 mx-auto mb-4 opacity-20" />
          <h3 class="text-lg font-medium text-terminal-highlight/60">Select a trade to view details</h3>
          <p class="text-sm">Detailed analysis and editing will appear here.</p>
        </div>
      </div>
    </main>
  </div>
</template>