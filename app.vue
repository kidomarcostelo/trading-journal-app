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
  ChevronsRight
} from 'lucide-vue-next'
import TradeForm from './components/TradeForm.vue'
import TradeList from './components/TradeList.vue'
import PaneNav from './components/PaneNav.vue'

const showForm = ref(false)
const isDark = ref(true)
const activeTab = ref('daily-trades')
const selectedTradeId = ref<string | null>(null)

const activeTrade = computed(() => {
  return trades.value?.find(t => t.ID === selectedTradeId.value)
})

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
    // Snap to 64px (icon mode) if less than 150px, otherwise min 150px, max 400px
    let newWidth = Math.min(e.clientX, 400)
    if (newWidth < 150) {
      newWidth = 64
    } else {
      lastSidebarWidth.value = newWidth
    }
    sidebarWidth.value = newWidth
  } else if (isResizing.value === 'list') {
    // Min width 100px, Max width 600px
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
      <div class="p-4 border-b border-terminal-gray flex items-center justify-between">
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
      
      <div class="flex-1 overflow-y-auto overflow-x-hidden">
        <div v-if="pending" class="p-8 text-center">
          <div class="inline-block w-6 h-6 border-2 border-terminal-gray border-t-terminal-accent rounded-full animate-spin"></div>
        </div>
        <TradeList 
          v-else 
          :trades="trades || []" 
          :active-id="selectedTradeId"
          :collapsed="isListCollapsed"
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
           <h1 class="text-2xl font-bold text-terminal-highlight mb-2">{{ activeTrade.Pair }}</h1>
           <div class="flex items-center gap-3 text-sm text-terminal-text/60">
             <span class="bg-terminal-gray/20 px-2 py-0.5 rounded">{{ activeTrade.Market }}</span>
             <span>{{ activeTrade.Date }}</span>
             <span :class="activeTrade.Status === 'Open' ? 'text-emerald-400' : ''">{{ activeTrade.Status }}</span>
           </div>
        </div>
        
        <!-- Placeholder for Phase 3 components -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div class="bg-terminal-black/30 border border-terminal-gray p-6 rounded-lg">
             <h3 class="font-medium text-terminal-highlight mb-4">Trade Data</h3>
             <pre class="text-xs text-terminal-text/40 overflow-auto max-h-60">{{ activeTrade }}</pre>
           </div>
           
           <div class="bg-terminal-black/30 border border-terminal-gray p-6 rounded-lg">
             <h3 class="font-medium text-terminal-highlight mb-4">Strategy</h3>
             <p class="text-sm text-terminal-text/60">Strategy chips will go here.</p>
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