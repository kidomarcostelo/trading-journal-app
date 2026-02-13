<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { 
  X, 
  Save, 
  GripVertical, 
  Plus, 
  ArrowLeft,
  LayoutDashboard
} from 'lucide-vue-next'
import { useSettings } from '~/composables/useSettings'
import { useToast } from '~/composables/useToast'
import PaneNav from '~/components/PaneNav.vue'
import type { ChipCategory } from '~/types'

const { settings, fetchSettings, saveSettings, isLoading: isSaving } = useSettings()
const { addToast } = useToast()

const { data: config, pending: configLoading } = useFetch<ChipCategory[]>('/api/config')

// Local state for editing
const localStrategy = ref<string[]>([])
const localPsychology = ref<string[]>([])
const activeTab = ref('settings')

const initLocalState = async () => {
    await fetchSettings()
    if (settings.value) {
        localStrategy.value = [...(settings.value.strategy || [])]
        localPsychology.value = [...(settings.value.psychology || [])]
    }
}

onMounted(() => {
    initLocalState()
})

const handleTabChange = (tab: string) => {
    if (tab !== 'settings') {
        navigateTo('/')
    }
}

// Compute available (unused) categories
const availableCategories = computed(() => {
    if (!config.value) return []
    const used = new Set([...localStrategy.value, ...localPsychology.value])
    return config.value.filter(c => !used.has(c.id)).map(c => c.id)
})

const handleSave = async () => {
    try {
        settings.value = {
            strategy: localStrategy.value,
            psychology: localPsychology.value
        }
        await saveSettings()
        addToast({ title: 'Success', message: 'Settings saved successfully', type: 'success' })
    } catch (e) {
        addToast({ title: 'Error', message: 'Failed to save settings', type: 'error' })
    }
}

// Drag and Drop Logic
const draggedItem = ref<{ id: string, source: 'strategy' | 'psychology' | 'available' } | null>(null)

const onDragStart = (e: DragEvent, id: string, source: 'strategy' | 'psychology' | 'available') => {
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.dropEffect = 'move'
        e.dataTransfer.setData('text/plain', JSON.stringify({ id, source }))
    }
    draggedItem.value = { id, source }
}

const onDrop = (e: DragEvent, targetList: 'strategy' | 'psychology' | 'available') => {
    const data = e.dataTransfer?.getData('text/plain')
    if (!data) return
    
    const { id, source } = JSON.parse(data)
    if (source === targetList) return 
    
    if (source === 'strategy') localStrategy.value = localStrategy.value.filter(i => i !== id)
    else if (source === 'psychology') localPsychology.value = localPsychology.value.filter(i => i !== id)

    if (targetList === 'strategy') localStrategy.value.push(id)
    else if (targetList === 'psychology') localPsychology.value.push(id)
    
    draggedItem.value = null
}

const removeCategory = (id: string, source: 'strategy' | 'psychology') => {
    if (source === 'strategy') localStrategy.value = localStrategy.value.filter(i => i !== id)
    else localPsychology.value = localPsychology.value.filter(i => i !== id)
}

const addCategory = (id: string) => {
    localStrategy.value.push(id)
}
</script>

<template>
  <div class="h-dvh flex overflow-hidden bg-terminal-black text-terminal-text font-sans">
    <!-- Pane 1: Navigation Sidebar (Reused) -->
    <div class="w-64 flex-shrink-0 border-r border-terminal-gray flex flex-col">
      <PaneNav 
        :active-tab="activeTab" 
        @update:active-tab="handleTabChange"
      />
    </div>

    <!-- Main Content Area -->
    <main class="flex-1 bg-terminal-dark overflow-y-auto">
      <div class="max-w-6xl mx-auto p-12">
        <!-- Header -->
        <div class="flex items-center justify-between mb-12">
          <div class="space-y-1">
            <h1 class="text-4xl font-bold text-terminal-highlight tracking-tight">Settings</h1>
            <p class="text-terminal-text/50">Configure your journal layout and chip categories.</p>
          </div>
          
          <div class="flex items-center gap-4">
            <NuxtLink 
              to="/" 
              class="px-4 py-2 text-sm font-medium text-terminal-text hover:text-terminal-highlight transition-colors flex items-center gap-2"
            >
              <ArrowLeft class="w-4 h-4" />
              Back to Journal
            </NuxtLink>
            <button 
                @click="handleSave" 
                :disabled="isSaving"
                class="px-8 py-2.5 bg-terminal-highlight text-terminal-black font-bold rounded-lg hover:bg-white transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-terminal-highlight/10"
            >
                <Save class="w-4 h-4" />
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <!-- Left: Selection Pool (4 columns) -->
          <div class="lg:col-span-4 space-y-6">
            <div class="bg-terminal-black/40 border border-terminal-gray rounded-2xl p-6">
              <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-terminal-text/40 mb-6 flex items-center gap-2">
                <Plus class="w-4 h-4" /> Available Chips
              </h3>
              
              <div 
                class="space-y-3 min-h-[400px]"
                @dragover.prevent
                @drop="onDrop($event, 'available')"
              >
                <div 
                    v-for="cat in availableCategories" 
                    :key="cat"
                    draggable="true"
                    @dragstart="onDragStart($event, cat, 'available')"
                    class="p-4 bg-terminal-black border border-terminal-gray rounded-xl cursor-grab active:cursor-grabbing hover:border-terminal-accent/50 group flex items-center justify-between transition-all"
                >
                    <span class="text-sm font-medium truncate">{{ cat }}</span>
                    <button @click="addCategory(cat)" class="p-1.5 rounded-md hover:bg-terminal-accent/10 text-terminal-accent opacity-0 group-hover:opacity-100 transition-all">
                        <Plus class="w-4 h-4" />
                    </button>
                </div>
                
                <div v-if="availableCategories.length === 0" class="flex flex-col items-center justify-center py-20 text-center space-y-3 opacity-20">
                  <div class="p-4 border-2 border-dashed border-terminal-gray rounded-full">
                    <Check class="w-8 h-8" />
                  </div>
                  <p class="text-xs font-bold uppercase tracking-widest">All chips assigned</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Configuration (8 columns) -->
          <div class="lg:col-span-8 space-y-8">
            <!-- Strategy Section -->
            <div 
              class="p-8 rounded-2xl border-2 border-dashed transition-all duration-300"
              :class="draggedItem ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-terminal-gray/30 bg-terminal-black/20'"
              @dragover.prevent
              @drop="onDrop($event, 'strategy')"
            >
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-lg font-bold text-terminal-highlight flex items-center gap-3">
                    <span class="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
                    Strategy Panel
                  </h3>
                  <span class="text-[10px] font-bold text-terminal-text/30 uppercase tracking-[0.2em]">Drop area</span>
                </div>

                <div v-if="localStrategy.length === 0" class="py-12 text-center border border-terminal-gray/10 rounded-xl bg-black/20">
                    <p class="text-sm text-terminal-text/30 italic">Drag categories here to display them in the Strategy tab.</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TransitionGroup name="list">
                    <div 
                        v-for="cat in localStrategy" 
                        :key="cat"
                        draggable="true"
                        @dragstart="onDragStart($event, cat, 'strategy')"
                        class="p-4 bg-terminal-black border border-terminal-gray rounded-xl cursor-grab active:cursor-grabbing flex items-center gap-4 hover:border-indigo-500/50 group transition-all"
                    >
                        <GripVertical class="w-4 h-4 text-terminal-text/20 group-hover:text-terminal-text/50" />
                        <span class="text-sm font-medium flex-1">{{ cat }}</span>
                        <button @click="removeCategory(cat, 'strategy')" class="p-1.5 text-terminal-text/20 hover:text-rose-400 hover:bg-rose-400/10 rounded-md transition-all">
                            <X class="w-4 h-4" />
                        </button>
                    </div>
                  </TransitionGroup>
                </div>
            </div>

            <!-- Psychology Section -->
            <div 
              class="p-8 rounded-2xl border-2 border-dashed transition-all duration-300"
              :class="draggedItem ? 'border-rose-500/30 bg-rose-500/5' : 'border-terminal-gray/30 bg-terminal-black/20'"
              @dragover.prevent
              @drop="onDrop($event, 'psychology')"
            >
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-lg font-bold text-terminal-highlight flex items-center gap-3">
                    <span class="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></span>
                    Psychology Panel
                  </h3>
                  <span class="text-[10px] font-bold text-terminal-text/30 uppercase tracking-[0.2em]">Drop area</span>
                </div>

                <div v-if="localPsychology.length === 0" class="py-12 text-center border border-terminal-gray/10 rounded-xl bg-black/20">
                    <p class="text-sm text-terminal-text/30 italic">Drag categories here to display them in the Psychology tab.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TransitionGroup name="list">
                    <div 
                        v-for="cat in localPsychology" 
                        :key="cat"
                        draggable="true"
                        @dragstart="onDragStart($event, cat, 'psychology')"
                        class="p-4 bg-terminal-black border border-terminal-gray rounded-xl cursor-grab active:cursor-grabbing flex items-center gap-4 hover:border-rose-500/50 group transition-all"
                    >
                        <GripVertical class="w-4 h-4 text-terminal-text/20 group-hover:text-terminal-text/50" />
                        <span class="text-sm font-medium flex-1">{{ cat }}</span>
                        <button @click="removeCategory(cat, 'psychology')" class="p-1.5 text-terminal-text/20 hover:text-rose-400 hover:bg-rose-400/10 rounded-md transition-all">
                            <X class="w-4 h-4" />
                        </button>
                    </div>
                  </TransitionGroup>
                </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Global UI Components -->
    <ToastNotification />
  </div>
</template>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
