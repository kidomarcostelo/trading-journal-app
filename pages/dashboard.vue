<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { 
  LayoutDashboard, 
  PlusCircle, 
  RefreshCw, 
  ChevronsLeft,
  ChevronsRight,
  Filter,
  ArrowUp,
  ArrowDown,
  Trash2,
  X,
  ClipboardCheck
} from 'lucide-vue-next'
import TradeForm from '~/components/TradeForm.vue'
import TradeList from '~/components/TradeList.vue'
import TradeDataTable from '~/components/TradeDataTable.vue'
import TradeStats from '~/components/TradeStats.vue'
import AnalyticsDashboard from '~/components/AnalyticsDashboard.vue'
import TradeScreenshots from '~/components/TradeScreenshots.vue'
import TradeReview from '~/components/TradeReview.vue'
import ChipPanel from '~/components/ChipPanel.vue'
import CalendarRange from '~/components/CalendarRange.vue'
import CollapsibleSection from '~/components/CollapsibleSection.vue'
import SaveControls from '~/components/ui/SaveControls.vue'
import DeleteConfirmationModal from '~/components/ui/DeleteConfirmationModal.vue'
import type { ChipCategory } from '~/types'
import { useUI } from '~/composables/useUI'
import { useSettings } from '~/composables/useSettings'

const { activeTab } = useUI()
const { settings, fetchSettings, isLoading: isSettingsLoading } = useSettings()
const showForm = ref(false)
const selectedTradeId = ref<string | null>(null)

onMounted(async () => {
  await fetchSettings()
})

// Deletion State
const showDeleteModal = ref(false)
const isDeletingTrade = ref(false)
const tradeToDeleteId = ref<string | null>(null)

// Fetch Trades & Config
const { data: trades, refresh, pending } = await useFetch<any[]>('/api/trades')
const { data: config } = await useFetch<ChipCategory[]>('/api/config')

// Unified Trade Logic
import { useTrades } from '~/composables/useTrades'
import { useAutoSave } from '~/composables/useAutoSave'
import { useToast } from '~/composables/useToast'
import { useDuration } from '~/composables/useDuration'

const { addToast } = useToast()
const { getDuration } = useDuration()

const { 
  filterPeriod, 
  startDate,
  endDate,
  customRangeLabel,
  sortBy, 
  sortDir, 
  filteredTrades 
} = useTrades(computed(() => trades.value || []))

const showCalendar = ref(false)
watch(filterPeriod, (newVal) => {
  if (newVal === 'custom') showCalendar.value = true
})

const handleFilterChange = () => {
  if (filterPeriod.value === 'custom') {
    showCalendar.value = true
  }
}

const handleFilterClick = () => {
  if (filterPeriod.value === 'custom') {
    showCalendar.value = true
  }
}

const activeDetailTab = ref<'journal' | 'charts' | 'review' | 'analytics'>('journal')
const showChecklist = ref(false)

const activeTrade = computed(() => {
  return filteredTrades.value.find(t => (t.ID || t.id) === selectedTradeId.value)
})

// Force re-render for live duration every minute
const now = ref(Date.now())
let durationInterval: NodeJS.Timer | null = null

const tradeDuration = computed(() => {
  if (!activeTrade.value) return '--'
  const _ = now.value
  return getDuration(
    activeTrade.value.Date || activeTrade.value['Date Created'] || activeTrade.value.createdAt, 
    activeTrade.value['Exit Date'], 
    activeTrade.value.Status
  )
})

// Contextual Analytics: Filter by Active Trade Pair
const analyticsTrades = computed(() => {
  if (!activeTrade.value || !activeTrade.value.Pair) return filteredTrades.value
  const currentPair = activeTrade.value.Pair.toLowerCase()
  return filteredTrades.value.filter(t => (t.Pair || '').toLowerCase() === currentPair)
})

const saveTrades = async (dirtyIds: Set<string>) => {
  if (dirtyIds.size === 0) return
  const tradesToSave = trades.value?.filter(t => dirtyIds.has(t.ID || t.id)) || []
  if (tradesToSave.length === 0) return

  // Blocker Validation
  const invalidTrade = tradesToSave.find(t => t.isChecklistValid === false)
  if (invalidTrade) {
    addToast({ title: 'Validation Error', message: `Trade ${invalidTrade.Pair || 'entry'} is missing mandatory checklist rules.`, type: 'error' })
    throw new Error('Checklist validation failed')
  }

  const payload = tradesToSave.map(trade => {
    const tradeData: any = { ...trade }
    for (const key in tradeData) {
      if (Array.isArray(tradeData[key])) tradeData[key] = tradeData[key].join(', ')
    }
    return tradeData
  })

  try {
    const result = await $fetch<{ success: boolean, count: number }>('/api/trades/batch', {
      method: 'PUT',
      body: payload
    })
    addToast({ title: 'Success', message: `${result.count} trade(s) saved`, type: 'success' })
  } catch (err) {
    addToast({ title: 'Error', message: 'Failed to save trades', type: 'error' })
    throw err
  }
}

const { saveMode, isDirty, dirtyTradeIds, isLoading, trackChange, triggerSave, onNavigate } = useAutoSave(saveTrades)

const handleTradeUpdate = (fieldsToUpdate: any) => {
  if (!activeTrade.value || !trades.value) return
  const index = trades.value.findIndex(t => (t.ID || t.id) === selectedTradeId.value)
  if (index !== -1) {
    const currentTrade = trades.value[index]
    
    // Use shared logic for updates (e.g. auto Exit Date)
    const processedUpdates = processTradeUpdate(currentTrade, fieldsToUpdate)

    trades.value[index] = { ...trades.value[index], ...processedUpdates }
    trackChange(activeTrade.value.ID || activeTrade.value.id)
  }
}

const selectTrade = async (id: string) => {
  if (selectedTradeId.value === id) return
  await onNavigate()
  selectedTradeId.value = id
}

const confirmDelete = (id: string) => {
  tradeToDeleteId.value = id
  showDeleteModal.value = true
}

const executeDelete = async () => {
  if (!tradeToDeleteId.value) return
  isDeletingTrade.value = true
  try {
    await $fetch('/api/trades', { method: 'DELETE', query: { id: tradeToDeleteId.value } })
    addToast({ title: 'Deleted', message: 'Trade removed', type: 'success' })
    if (trades.value) {
      trades.value = trades.value.filter(t => (t.ID || t.id) !== tradeToDeleteId.value)
    }
    selectedTradeId.value = trades.value?.[0]?.ID || null
    showDeleteModal.value = false
  } catch (err) {
    addToast({ title: 'Error', message: 'Failed to delete trade', type: 'error' })
  } finally {
    isDeletingTrade.value = false
  }
}

const formatDate = (val: any) => {
  if (!val) return '--'
  const numVal = Number(val)
  if (!isNaN(numVal)) {
    if (numVal > 20000 && numVal < 100000) {
      return new Date((numVal - 25569) * 86400 * 1000).toLocaleDateString()
    } else if (numVal > 100000) {
      return new Date(numVal).toLocaleDateString()
    }
  }
  return String(val)
}

// List Resizing Logic
const listWidth = ref(320)
const lastListWidth = ref(320)
const isResizingList = ref(false)
const isListCollapsed = computed(() => listWidth.value <= 120)

const startListResize = () => {
  isResizingList.value = true
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const doListResize = (e: MouseEvent) => {
  if (!isResizingList.value) return
  // We need sidebar width here to calculate correctly
  const { sidebarWidth } = useUI()
  const newWidth = Math.max(100, Math.min(e.clientX - sidebarWidth.value, 600))
  listWidth.value = newWidth
  if (newWidth > 120) lastListWidth.value = newWidth
}

const stopListResize = () => {
  isResizingList.value = false
}

const toggleListCollapse = () => {
  if (isListCollapsed.value) listWidth.value = Math.max(320, lastListWidth.value)
  else { lastListWidth.value = listWidth.value; listWidth.value = 100 }
}

onMounted(() => {
  window.addEventListener('mousemove', doListResize)
  window.addEventListener('mouseup', stopListResize)
  durationInterval = setInterval(() => { now.value = Date.now() }, 60000)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', doListResize)
  window.removeEventListener('mouseup', stopListResize)
  if (durationInterval) clearInterval(durationInterval)
})
</script>

<template>
  <!-- Layout provides Pane 1 (Sidebar) and Handle 1 -->
  <div class="flex-1 flex overflow-hidden">
    <!-- Pane 2: Trade List -->
    <section 
      data-testid="pane-list" 
      :style="{ width: `${listWidth}px` }"
      class="flex-shrink-0 border-r border-terminal-gray flex flex-col bg-terminal-black overflow-hidden relative"
    >
      <div 
        class="border-b border-terminal-gray flex flex-col gap-3 bg-terminal-black"
        :class="isListCollapsed ? 'p-2' : 'p-4'"
      >
        <div class="flex items-center" :class="isListCollapsed ? 'flex-col gap-2' : 'justify-between'">
          <h2 v-if="!isListCollapsed" class="font-medium text-terminal-highlight truncate">Trades</h2>
          <div class="flex items-center gap-1">
            <button @click="toggleListCollapse" class="p-1.5 text-terminal-text/60 hover:text-terminal-highlight transition-all">
              <ChevronsRight v-if="isListCollapsed" class="w-4 h-4" />
              <ChevronsLeft v-else class="w-4 h-4" />
            </button>
            <button @click="() => refresh()" class="p-1.5 text-terminal-text/60 hover:text-terminal-highlight transition-all" :disabled="pending">
              <RefreshCw :class="['w-4 h-4', pending ? 'animate-spin' : '']" />
            </button>
            <button v-if="!isListCollapsed" @click="showForm = true" class="p-1.5 text-terminal-accent hover:bg-terminal-accent/10 rounded-md transition-all">
              <PlusCircle class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div v-if="!isListCollapsed" class="flex flex-col gap-2">
           <div class="flex items-center gap-2">
             <div class="relative flex-1">
               <select 
                 v-model="filterPeriod" 
                 @click="handleFilterClick"
                 class="w-full appearance-none bg-terminal-black border border-terminal-gray/30 rounded px-2 py-1 text-xs text-terminal-text hover:border-terminal-gray/50 focus:border-terminal-accent outline-none cursor-pointer"
               >
                 <option value="all">All Time</option>
                 <option value="week">This Week</option>
                 <option value="last-week">Last Week</option>
                 <option value="month">This Month</option>
                 <option value="last-month">Last Month</option>
                 <option value="custom">
                   {{ filterPeriod === 'custom' ? customRangeLabel : 'Custom Range' }}
                 </option>
               </select>
               <Filter class="w-3 h-3 absolute right-2 top-1.5 text-terminal-text/40 pointer-events-none" />
             </div>
             <div class="relative flex-1 group flex items-center gap-1">
               <div class="relative flex-1">
                 <select v-model="sortBy" class="w-full appearance-none bg-terminal-black border border-terminal-gray/30 rounded px-2 py-1 text-xs text-terminal-text hover:border-terminal-gray/50 focus:border-terminal-accent outline-none cursor-pointer">
                   <option value="Date">Date</option>
                   <option value="Status">Status</option>
                   <option value="Pair">Pair</option>
                 </select>
               </div>
               <button 
                 @click="sortDir = sortDir === 'asc' ? 'desc' : 'asc'"
                 class="p-1 hover:bg-terminal-gray/20 rounded transition-colors text-terminal-text/60 hover:text-terminal-highlight"
                 :title="sortDir === 'asc' ? 'Sort Ascending' : 'Sort Descending'"
               >
                 <ArrowUp v-if="sortDir === 'asc'" class="w-3.5 h-3.5" />
                 <ArrowDown v-else class="w-3.5 h-3.5" />
               </button>
             </div>
           </div>

           <!-- Custom Date Range Picker -->
           <div v-if="filterPeriod === 'custom' && showCalendar" class="animate-in fade-in slide-in-from-top-1 duration-200">
             <CalendarRange 
               v-model:startDate="startDate"
               v-model:endDate="endDate"
               inline
               @close="showCalendar = false"
             />
           </div>
        </div>
      </div>
      
      <div class="flex-1 overflow-y-auto overflow-x-hidden">
        <TradeList 
          :trades="trades || []" 
          :active-id="selectedTradeId"
          :collapsed="isListCollapsed"
          :filter-period="filterPeriod"
          :start-date="startDate"
          :end-date="endDate"
          :sort-by="sortBy"
          :sort-dir="sortDir"
          @select="selectTrade"
          @delete="confirmDelete"
        />
      </div>
    </section>

    <!-- Handle 2 -->
    <div 
      @mousedown.prevent="startListResize"
      class="w-1 h-full cursor-col-resize hover:bg-terminal-accent/50 transition-colors z-20 flex-shrink-0 bg-terminal-gray/10"
    ></div>

    <!-- Pane 3: Main Detail View -->
    <main data-testid="pane-detail" class="flex-1 bg-terminal-dark overflow-y-auto relative">
      <div v-if="showForm" class="absolute inset-0 z-50 bg-terminal-black/80 backdrop-blur-sm flex items-center justify-center p-6">
        <div class="bg-terminal-dark border border-terminal-gray rounded-xl shadow-2xl w-full max-w-[90vw] h-[85vh] relative overflow-hidden">
          <button @click="showForm = false" class="absolute top-4 right-4 text-terminal-text/40 hover:text-terminal-text z-10">
            <PlusCircle class="w-6 h-6 rotate-45" />
          </button>
          <TradeForm :config="config || []" @success="refresh(); showForm = false" />
        </div>
      </div>

      <div v-if="activeTrade" class="p-8 w-full">
        <!-- Active Trade Detail Rendering -->
        <div class="mb-8 flex flex-col gap-6">
           <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
             <div class="flex flex-col gap-2">
               <div class="flex items-center gap-3">
                 <h1 class="text-3xl font-bold text-terminal-highlight tracking-tight">{{ activeTrade.Pair }}</h1>
                 <button @click="confirmDelete(activeTrade.ID || activeTrade.id)" class="ml-2 p-1.5 rounded-lg text-terminal-text/40 hover:text-error hover:bg-error/10 transition-all"><Trash2 class="w-4 h-4" /></button>
               </div>
               <div class="flex items-center gap-4 text-sm text-terminal-text/60">
                 <span :class="activeTrade.Status === 'Open' ? 'text-emerald-400 font-medium' : ''">{{ activeTrade.Status }}</span>
                 <span class="w-1 h-1 rounded-full bg-terminal-gray/40"></span>
                 <span>{{ activeTrade.Market }}</span>
                 <span class="w-1 h-1 rounded-full bg-terminal-gray/40"></span>
                 <span>{{ formatDate(activeTrade.createdAt || activeTrade.Date || activeTrade['Date Created']) }}</span>
                 <span class="w-1 h-1 rounded-full bg-terminal-gray/40"></span>
                 <span>{{ tradeDuration }}</span>
               </div>
             </div>
             <TradeStats :trades="filteredTrades" />
           </div>
        </div>

        <div class="flex items-center gap-6 border-b border-terminal-gray mb-6">
          <button @click="activeDetailTab = 'journal'" class="pb-2 text-sm font-medium transition-colors relative" :class="activeDetailTab === 'journal' ? 'text-terminal-highlight' : 'text-terminal-text/60'">
            Journal <span v-if="activeDetailTab === 'journal'" class="absolute bottom-0 left-0 w-full h-0.5 bg-terminal-accent"></span>
          </button>
          <button @click="activeDetailTab = 'charts'" class="pb-2 text-sm font-medium transition-colors relative" :class="activeDetailTab === 'charts' ? 'text-terminal-highlight' : 'text-terminal-text/60'">
            Charts <span v-if="activeDetailTab === 'charts'" class="absolute bottom-0 left-0 w-full h-0.5 bg-terminal-accent"></span>
          </button>
          <button @click="activeDetailTab = 'review'" class="pb-2 text-sm font-medium transition-colors relative" :class="activeDetailTab === 'review' ? 'text-terminal-highlight' : 'text-terminal-text/60'">
            Review <span v-if="activeDetailTab === 'review'" class="absolute bottom-0 left-0 w-full h-0.5 bg-terminal-accent"></span>
          </button>
          <button @click="activeDetailTab = 'analytics'" class="pb-2 text-sm font-medium transition-colors relative" :class="activeDetailTab === 'analytics' ? 'text-terminal-highlight' : 'text-terminal-text/60'">
            Analytics <span v-if="activeDetailTab === 'analytics'" class="absolute bottom-0 left-0 w-full h-0.5 bg-terminal-accent"></span>
          </button>
        </div>
        
        <div v-if="activeDetailTab === 'journal'" class="space-y-4">
           <CollapsibleSection title="Trade Data">
             <TradeDataTable :trade="activeTrade" :config="config || []" @update="handleTradeUpdate" />
           </CollapsibleSection>

           <!-- Dynamic Configurable Panels -->
           <template v-if="settings?.panels?.length">
             <CollapsibleSection 
               v-for="panel in settings.panels" 
               :key="panel.id" 
               :title="panel.title"
             >
               <ChipPanel 
                 v-if="config" 
                 :config="config" 
                 :title="panel.title"
                 :categories="panel.categories"
                 :modelValue="activeTrade" 
                 @update:modelValue="handleTradeUpdate" 
               />
               <div v-else class="text-sm text-terminal-text/60 animate-pulse">Loading categories...</div>
             </CollapsibleSection>
           </template>
           <div v-else-if="!isSettingsLoading" class="text-center py-12 border border-dashed border-terminal-gray rounded-xl opacity-30">
             <p class="text-sm italic">No journal panels configured. <NuxtLink to="/settings" class="text-terminal-accent hover:underline">Go to settings</NuxtLink></p>
           </div>
        </div>
        <div v-else-if="activeDetailTab === 'charts'" class="space-y-4">
           <CollapsibleSection title="Screenshots"><TradeScreenshots :trade="activeTrade" @update="handleTradeUpdate" /></CollapsibleSection>
        </div>
        <div v-else-if="activeDetailTab === 'review'"><TradeReview :trade="activeTrade" :config="config || []" @update="handleTradeUpdate" /></div>
        <div v-else-if="activeDetailTab === 'analytics'">
          <AnalyticsDashboard :trades="analyticsTrades" />
        </div>
      </div>

      <div v-else class="p-8 max-w-4xl mx-auto text-center py-20 text-terminal-text/40">
        <LayoutDashboard class="w-12 h-12 mx-auto mb-4 opacity-20" />
        <h3 class="text-lg font-medium">Select a trade to view details</h3>
      </div>
    </main>

        <SaveControls v-if="selectedTradeId" v-model="saveMode" :is-dirty="isDirty" :is-loading="isLoading" :dirty-count="dirtyTradeIds.size" @save="triggerSave" />

        <!-- Floating Checklist Widget -->
        <div v-if="selectedTradeId" class="fixed bottom-24 right-6 z-40 flex flex-col items-end">
          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform translate-y-4 opacity-0"
            enter-to-class="transform translate-y-0 opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="transform translate-y-0 opacity-100"
            leave-to-class="transform translate-y-4 opacity-0"
          >
            <div v-if="showChecklist" class="mb-4">
              <FloatingChecklist 
                :modelValue="Array.isArray(activeTrade?.checklistRulesChecked) ? activeTrade.checklistRulesChecked : activeTrade?.checklistRulesChecked ? activeTrade.checklistRulesChecked.split(', ') : []"
                @update:modelValue="(val) => handleTradeUpdate({ checklistRulesChecked: val })"
                @update:score="(score) => handleTradeUpdate({ checklistScore: score })"
                @update:tier="(tier) => handleTradeUpdate({ tier: tier })"
                @update:isValid="(valid) => handleTradeUpdate({ isChecklistValid: valid })"
              />
            </div>
          </transition>
          
          <button 
            @click="showChecklist = !showChecklist"
            class="group relative flex items-center justify-center bg-terminal-highlight text-terminal-black rounded-full p-4 shadow-lg shadow-terminal-highlight/20 hover:shadow-terminal-highlight/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            title="Setup Checklist"
          >
            <X v-if="showChecklist" class="w-6 h-6" />
            <ClipboardCheck v-else class="w-6 h-6" />
            <span v-if="activeTrade?.tier && !showChecklist" class="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-emerald-500 rounded-full border-2 border-terminal-black flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
              {{ activeTrade.tier.charAt(0) }}
            </span>
          </button>
        </div>

        <DeleteConfirmationModal :is-open="showDeleteModal" :is-deleting="isDeletingTrade" @close="showDeleteModal = false" @confirm="executeDelete" />

      </div>

    </template>

    