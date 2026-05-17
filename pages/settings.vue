<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { 
  X, 
  Save, 
  GripVertical, 
  Plus, 
  ArrowLeft,
  Check,
  Trash2,
  Settings as SettingsIcon,
  Layers,
  Edit3,
  ChevronRight,
  ChevronDown,
  Library,
  ExternalLink
} from 'lucide-vue-next'
import { useSettings } from '~/composables/useSettings'
import { useToast } from '~/composables/useToast'
import type { ChipCategory } from '~/types'

const { settings, fetchSettings, saveSettings, isLoading: isSaving } = useSettings()
const { addToast } = useToast()

const { data: config, refresh: refreshConfig, pending: configLoading } = useFetch<ChipCategory[]>('/api/config')

interface Panel {
  id: string
  title: string
  categories: string[]
}

const localPanels = ref<Panel[]>([])
const localChips = ref<ChipCategory[]>([])
const isSavingLibrary = ref(false)

const initLocalState = async () => {
    await fetchSettings()
    if (settings.value?.panels) {
        localPanels.value = JSON.parse(JSON.stringify(settings.value.panels))
    }
    if (config.value) {
        localChips.value = JSON.parse(JSON.stringify(config.value))
    }
}

onMounted(() => {
    initLocalState()
})

// Sync local chips when config loads
watch(config, (newVal) => {
    if (newVal) localChips.value = JSON.parse(JSON.stringify(newVal))
})

const availableCategories = computed(() => {
    const used = new Set(localPanels.value.flatMap(p => p.categories))
    return localChips.value.filter(c => !used.has(c.id)).map(c => c.id)
})

const addPanel = () => {
    localPanels.value.push({
        id: 'panel-' + Date.now(),
        title: 'New Panel',
        categories: []
    })
}

const removePanel = (panelId: string) => {
    localPanels.value = localPanels.value.filter(p => p.id !== panelId)
}

const removeCategory = (catId: string, panelId: string) => {
    const panel = localPanels.value.find(p => p.id === panelId)
    if (panel) {
        panel.categories = panel.categories.filter(c => c !== catId)
    }
}

const handleSaveLayout = async () => {
    try {
        settings.value = { panels: localPanels.value }
        await saveSettings()
        addToast({ title: 'Success', message: 'Layout saved successfully', type: 'success' })
    } catch (e) {
        addToast({ title: 'Error', message: 'Failed to save layout', type: 'error' })
    }
}

// --- Chip Library Management ---
const editingCategoryId = ref<string | null>(null)
const newCategoryName = ref('')
const newValueInputs = ref<Record<string, string>>({})

const addCategory = () => {
    if (!newCategoryName.value.trim()) return
    const id = newCategoryName.value.trim()
    if (localChips.value.find(c => c.id === id)) {
        addToast({ title: 'Error', message: 'Category already exists', type: 'error' })
        return
    }
    localChips.value.push({ id, values: [] })
    newCategoryName.value = ''
    addToast({ title: 'Added', message: `Category "${id}" created locally`, type: 'info' })
}

const removeCategoryFromLibrary = (id: string) => {
    localChips.value = localChips.value.filter(c => c.id !== id)
    // Also remove from any panels
    localPanels.value.forEach(p => {
        p.categories = p.categories.filter(c => c !== id)
    })
}

const addValueToCategory = (catId: string) => {
    const input = newValueInputs.value[catId]?.trim()
    if (!input) return
    const cat = localChips.value.find(c => c.id === catId)
    if (cat) {
        if (!cat.values.includes(input)) {
            cat.values.push(input)
        }
        newValueInputs.value[catId] = ''
    }
}

const removeValueFromCategory = (catId: string, value: string) => {
    const cat = localChips.value.find(c => c.id === catId)
    if (cat) {
        cat.values = cat.values.filter(v => v !== value)
    }
}

const handleSaveLibrary = async () => {
    isSavingLibrary.value = true
    try {
        await $fetch('/api/config', {
            method: 'PUT',
            body: localChips.value
        })
        await refreshConfig()
        addToast({ title: 'Success', message: 'Chip library updated in Spreadsheet', type: 'success' })
    } catch (e) {
        addToast({ title: 'Error', message: 'Failed to save chip library', type: 'error' })
    } finally {
        isSavingLibrary.value = false
    }
}

// Drag and Drop Logic
const draggedItem = ref<{ catId: string, sourcePanelId: string | 'available' } | null>(null)

const onDragStart = (e: DragEvent, catId: string, sourcePanelId: string | 'available') => {
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', JSON.stringify({ catId, sourcePanelId }))
    }
    draggedItem.value = { catId, sourcePanelId }
}

const onDrop = (e: DragEvent, targetPanelId: string | 'available') => {
    const data = e.dataTransfer?.getData('text/plain')
    if (!data) return
    const { catId, sourcePanelId } = JSON.parse(data)
    if (sourcePanelId === targetPanelId) return 

    // Remove from source
    if (sourcePanelId !== 'available') {
        const sourcePanel = localPanels.value.find(p => p.id === sourcePanelId)
        if (sourcePanel) sourcePanel.categories = sourcePanel.categories.filter(c => c !== catId)
    }

    // Add to target
    if (targetPanelId !== 'available') {
        const targetPanel = localPanels.value.find(p => p.id === targetPanelId)
        if (targetPanel) targetPanel.categories.push(catId)
    }
    
    draggedItem.value = null
}

const addCategoryToPanel = (catId: string, panelId: string) => {
    const panel = localPanels.value.find(p => p.id === panelId)
    if (panel && !panel.categories.includes(catId)) panel.categories.push(catId)
}
</script>

<template>
  <main class="flex-1 bg-terminal-dark overflow-y-auto">
    <div class="max-w-[1600px] mx-auto p-12 pb-32">
      <!-- Header -->
      <div class="flex items-center justify-between mb-12">
        <div class="space-y-1">
          <div class="flex items-center gap-3 text-terminal-accent mb-2">
            <SettingsIcon class="w-5 h-5" />
            <span class="text-xs font-bold uppercase tracking-widest">Configuration</span>
          </div>
          <h1 class="text-4xl font-bold text-terminal-highlight tracking-tight">System Settings</h1>
          <p class="text-terminal-text/50">Manage your chip library and dashboard panels.</p>
        </div>
        
        <div class="flex items-center gap-4">
          <NuxtLink to="/dashboard" class="px-4 py-2 text-sm font-medium text-terminal-text hover:text-terminal-highlight transition-colors flex items-center gap-2">
            <ArrowLeft class="w-4 h-4" /> Back to Dashboard
          </NuxtLink>
          <div class="h-8 w-px bg-terminal-gray/30 mx-2"></div>
          <button @click="handleSaveLibrary" :disabled="isSavingLibrary" class="px-6 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-500/50 text-indigo-100 font-bold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50">
            <Library class="w-4 h-4" /> {{ isSavingLibrary ? 'Saving Library...' : 'Update Library' }}
          </button>
          <button @click="handleSaveLayout" :disabled="isSaving" class="px-8 py-2.5 bg-terminal-highlight text-terminal-black font-bold rounded-lg hover:bg-white transition-all flex items-center gap-2 disabled:opacity-50">
            <Save class="w-4 h-4" /> {{ isSaving ? 'Saving Layout...' : 'Save Layout' }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <!-- Sidebar: Selection Pool & Library CRUD -->
        <div class="lg:col-span-4 sticky top-12 space-y-6">
          <div class="bg-terminal-black/40 border border-terminal-gray rounded-2xl overflow-hidden">
            <div class="p-6 border-b border-terminal-gray bg-terminal-black/50">
                <h3 class="text-[10px] font-bold uppercase tracking-[0.2em] text-terminal-text/40 mb-4 flex items-center gap-2">
                    <Library class="w-4 h-4" /> Chip Categories Library
                </h3>
                <div class="flex gap-2">
                    <input 
                        v-model="newCategoryName"
                        @keyup.enter="addCategory"
                        placeholder="New category name..."
                        class="flex-1 bg-terminal-black border border-terminal-gray rounded-lg px-3 py-2 text-xs text-terminal-highlight outline-none focus:border-terminal-accent transition-all"
                    />
                    <button @click="addCategory" class="p-2 bg-terminal-accent text-terminal-black rounded-lg hover:bg-white transition-all">
                        <Plus class="w-4 h-4" />
                    </button>
                </div>
            </div>
            
            <div class="p-4 space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div 
                  v-for="cat in localChips" 
                  :key="cat.id"
                  class="bg-terminal-black border border-terminal-gray rounded-xl overflow-hidden transition-all"
                  :class="editingCategoryId === cat.id ? 'ring-1 ring-terminal-accent' : ''"
              >
                  <!-- Header -->
                  <div 
                    class="p-3 flex items-center justify-between group cursor-pointer"
                    @click="editingCategoryId = editingCategoryId === cat.id ? null : cat.id"
                  >
                    <div class="flex items-center gap-3 truncate">
                        <div 
                            draggable="true" 
                            @dragstart="onDragStart($event, cat.id, 'available')"
                            class="p-1 hover:bg-terminal-gray/20 rounded cursor-grab"
                            @click.stop
                        >
                            <GripVertical class="w-3.5 h-3.5 text-terminal-text/30" />
                        </div>
                        <span class="text-sm font-medium truncate" :class="availableCategories.includes(cat.id) ? 'text-terminal-highlight' : 'text-terminal-text/40'">
                            {{ cat.id }}
                        </span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-[9px] font-bold text-terminal-text/30 px-1.5 py-0.5 bg-terminal-gray/10 rounded-full border border-terminal-gray/20">
                            {{ cat.values.length }}
                        </span>
                        <ChevronDown v-if="editingCategoryId === cat.id" class="w-4 h-4 text-terminal-text/40" />
                        <ChevronRight v-else class="w-4 h-4 text-terminal-text/20 group-hover:text-terminal-text/40" />
                    </div>
                  </div>

                  <!-- Edit Section -->
                  <div v-if="editingCategoryId === cat.id" class="p-4 pt-0 border-t border-terminal-gray/30 bg-terminal-black/50 space-y-4">
                    <div class="pt-4 space-y-3">
                        <h4 class="text-[9px] font-bold uppercase tracking-widest text-terminal-text/40">Manage Chips</h4>
                        <div class="flex flex-wrap gap-1.5">
                            <div v-for="val in cat.values" :key="val" class="inline-flex items-center gap-1.5 px-2 py-1 bg-terminal-gray/20 rounded-md border border-terminal-gray/30 group/val">
                                <span class="text-[11px] text-terminal-text">{{ val }}</span>
                                <button @click="removeValueFromCategory(cat.id, val)" class="text-terminal-text/20 hover:text-rose-400">
                                    <X class="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <input 
                                v-model="newValueInputs[cat.id]"
                                @keyup.enter="addValueToCategory(cat.id)"
                                placeholder="Add option..."
                                class="flex-1 bg-terminal-dark border border-terminal-gray rounded-lg px-2 py-1.5 text-xs text-terminal-text outline-none focus:border-terminal-accent"
                            />
                            <button @click="addValueToCategory(cat.id)" class="p-1.5 bg-terminal-gray/20 hover:bg-terminal-accent hover:text-terminal-black rounded-lg transition-all">
                                <Plus class="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div class="pt-4 border-t border-terminal-gray/20 flex justify-between items-center">
                        <div class="flex gap-1">
                            <button 
                                v-for="panel in localPanels" 
                                :key="panel.id"
                                @click="addCategoryToPanel(cat.id, panel.id)"
                                class="px-2 py-1 rounded bg-terminal-accent/10 border border-terminal-accent/30 text-terminal-accent text-[8px] font-bold uppercase hover:bg-terminal-accent hover:text-terminal-black transition-all"
                            >
                                Add to {{ panel.title.slice(0, 10) }}...
                            </button>
                        </div>
                        <button @click="removeCategoryFromLibrary(cat.id)" class="p-1.5 text-terminal-text/20 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all" title="Delete Category">
                            <Trash2 class="w-4 h-4" />
                        </button>
                    </div>
                  </div>
              </div>
              
              <div v-if="localChips.length === 0" class="flex flex-col items-center justify-center py-12 text-center opacity-20">
                <Check class="w-6 h-6 mb-2" />
                <p class="text-[10px] font-bold uppercase tracking-widest">Library is empty</p>
              </div>
            </div>
          </div>
          
          <div class="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl flex items-start gap-4">
            <div class="p-2 bg-indigo-500/20 rounded-lg">
                <ExternalLink class="w-4 h-4 text-indigo-300" />
            </div>
            <div class="space-y-1">
                <h4 class="text-xs font-bold text-indigo-200">Library Sync</h4>
                <p class="text-[11px] text-indigo-200/60 leading-relaxed">
                    Changes to the <strong>Library</strong> must be saved separately using the "Update Library" button to sync with your Google Spreadsheet.
                </p>
            </div>
          </div>
        </div>

        <!-- Main: Panels Editor -->
        <div class="lg:col-span-8 space-y-8">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-terminal-text/40 flex items-center gap-2">
                <Layers class="w-4 h-4" /> Active Panels Configuration
            </h3>
            <button 
              @click="addPanel" 
              class="px-4 py-2 bg-terminal-gray/20 hover:bg-terminal-accent/20 border border-terminal-gray/30 hover:border-terminal-accent/50 rounded-lg text-xs font-bold uppercase tracking-widest text-terminal-text hover:text-terminal-accent transition-all flex items-center gap-2"
            >
              <Plus class="w-4 h-4" /> Add New Panel
            </button>
          </div>

          <TransitionGroup name="list">
            <div 
              v-for="panel in localPanels" 
              :key="panel.id" 
              data-testid="panel-config"
              class="p-8 rounded-2xl border-2 border-dashed transition-all duration-300 relative group"
              :class="draggedItem ? 'border-terminal-accent/30 bg-terminal-accent/5' : 'border-terminal-gray/30 bg-terminal-black/20'"
              @dragover.prevent
              @drop="onDrop($event, panel.id)"
            >
                <div class="flex items-center justify-between mb-8">
                  <div class="flex items-center gap-4 flex-1">
                    <div class="p-2 bg-terminal-black border border-terminal-gray rounded-lg group-hover:border-terminal-accent transition-colors">
                      <Layers class="w-4 h-4 text-terminal-highlight" />
                    </div>
                    <input 
                      v-model="panel.title" 
                      class="bg-transparent border-b border-transparent hover:border-terminal-gray focus:border-terminal-accent text-xl font-bold text-terminal-highlight outline-none px-1 py-0.5 transition-all w-full max-w-md"
                      placeholder="Panel Title..."
                    />
                  </div>
                  
                  <button 
                    @click="removePanel(panel.id)" 
                    class="p-2 text-terminal-text/20 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Panel"
                  >
                    <Trash2 class="w-5 h-5" />
                  </button>
                </div>

                <div v-if="panel.categories.length === 0" class="py-12 text-center border border-terminal-gray/10 rounded-xl bg-black/20">
                    <p class="text-sm text-terminal-text/30 italic">Drag categories from your Library here.</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <TransitionGroup name="list">
                    <div 
                        v-for="catId in panel.categories" 
                        :key="catId"
                        draggable="true"
                        data-testid="category-item"
                        @dragstart="onDragStart($event, catId, panel.id)"
                        class="p-4 bg-terminal-black border border-terminal-gray rounded-xl cursor-grab active:cursor-grabbing flex items-center gap-4 hover:border-indigo-500/50 group transition-all"
                    >
                        <GripVertical class="w-4 h-4 text-terminal-text/20 group-hover:text-terminal-text/50" />
                        <span class="text-sm font-medium flex-1">{{ catId }}</span>
                        <button 
                            @click="removeCategory(catId, panel.id)" 
                            data-testid="remove-category-btn"
                            class="p-1.5 text-terminal-text/20 hover:text-rose-400 hover:bg-rose-400/10 rounded-md transition-all"
                        >
                            <X class="w-4 h-4" />
                        </button>
                    </div>
                  </TransitionGroup>
                </div>
            </div>
          </TransitionGroup>

          <div v-if="localPanels.length === 0" class="py-24 text-center border-2 border-dashed border-terminal-gray/20 rounded-2xl opacity-30 flex flex-col items-center gap-4">
            <Layers class="w-12 h-12 opacity-50" />
            <div>
              <p class="text-lg font-medium">No panels configured.</p>
              <p class="text-sm">Assign categories from your library to start building your dashboard.</p>
            </div>
            <button 
              @click="addPanel" 
              class="mt-4 px-6 py-2 bg-terminal-accent/20 hover:bg-terminal-accent/40 border border-terminal-accent/50 rounded-lg text-sm font-bold uppercase tracking-widest text-terminal-accent transition-all flex items-center gap-2"
            >
              <Plus class="w-4 h-4" /> Create First Panel
            </button>
          </div>

          <div class="pt-12 mt-12 border-t border-terminal-gray/30">
            <div class="flex justify-between items-center mb-8">
              <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-terminal-text/40 flex items-center gap-2">
                  <Check class="w-4 h-4" /> Checklist & Tiers Configuration
              </h3>
            </div>
            <SettingsChecklist />
          </div>

        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.list-move, .list-enter-active, .list-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.list-enter-from, .list-leave-to { opacity: 0; transform: scale(0.95); }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
</style>