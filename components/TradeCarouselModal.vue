<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-vue-next'

const props = defineProps<{
  trades: any[]
  initialIndex: number
  isOpen: boolean
}>()

const emit = defineEmits(['close'])

const currentIndex = ref(props.initialIndex)
const imageMode = ref<'before' | 'after'>('before')

// Sync index when opened
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    currentIndex.value = props.initialIndex
    imageMode.value = getBeforeImages(currentTrade.value).length > 0 ? 'before' : 'after'
  }
})

const currentTrade = computed(() => props.trades[currentIndex.value] || {})

const hasNext = computed(() => currentIndex.value < props.trades.length - 1)
const hasPrev = computed(() => currentIndex.value > 0)

const nextTrade = () => { if (hasNext.value) currentIndex.value++ }
const prevTrade = () => { if (hasPrev.value) currentIndex.value-- }
const closeModal = () => emit('close')

// Keyboard Navigation
const handleKeydown = (e: KeyboardEvent) => {
  if (!props.isOpen) return
  if (e.key === 'ArrowRight') nextTrade()
  if (e.key === 'ArrowLeft') prevTrade()
  if (e.key === 'Escape') closeModal()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))

// Data Extractors
const getPnLClass = (trade: any) => {
  const pnlKey = Object.keys(trade).find(k => k.toLowerCase().includes('pnl') || k.includes('%'))
  if (!pnlKey) return 'text-terminal-text border-terminal-gray/50'
  const val = parseFloat(trade[pnlKey])
  if (val > 0) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
  if (val < 0) return 'text-rose-400 border-rose-500/20 bg-rose-500/10'
  return 'text-terminal-text border-terminal-gray/50'
}

const formatPnL = (trade: any) => {
  const pnlKey = Object.keys(trade).find(k => k.toLowerCase().includes('pnl') || k.includes('%'))
  return pnlKey ? trade[pnlKey] : '0'
}

const getBeforeImages = (trade: any) => {
  const key = Object.keys(trade).find(k => k.toLowerCase().includes('before') && /picture|image|img/i.test(k))
  const val = key ? trade[key] : []
  return Array.isArray(val) ? val : (val ? [val] : [])
}

const getAfterImages = (trade: any) => {
  const key = Object.keys(trade).find(k => k.toLowerCase().includes('after') && /picture|image|img/i.test(k))
  const val = key ? trade[key] : []
  return Array.isArray(val) ? val : (val ? [val] : [])
}

const activeImage = computed(() => {
  const before = getBeforeImages(currentTrade.value)
  const after = getAfterImages(currentTrade.value)
  
  if (imageMode.value === 'before' && before.length > 0) return before[0]
  if (imageMode.value === 'after' && after.length > 0) return after[0]
  
  // Fallback
  return before.length > 0 ? before[0] : (after.length > 0 ? after[0] : null)
})

const hasBothImages = computed(() => {
  return getBeforeImages(currentTrade.value).length > 0 && getAfterImages(currentTrade.value).length > 0
})

const isImageColumn = (header: string) => /picture|image|img/i.test(header)
const isJournalColumn = (header: string) => /journal|review/i.test(header)
const isBasicInfoColumn = (header: string) => /pair|date|pnl|status|action|market|risk|mae|mfe|created/i.test(header)

// Dynamic Tags
const tradeTags = computed(() => {
  const tags: { category: string, values: string[] }[] = []
  Object.keys(currentTrade.value).forEach(key => {
    const val = currentTrade.value[key]
    if (Array.isArray(val) && !isImageColumn(key) && !isJournalColumn(key)) {
      if (val.length > 0) {
        tags.push({ category: key, values: val })
      }
    } else if (typeof val === 'string' && !isBasicInfoColumn(key) && !isImageColumn(key) && !isJournalColumn(key)) {
      // Catch single string tags like 'Mental Category'
      if (val.trim() && val !== 'None / Untagged' && val !== 'false' && val !== 'true') {
        tags.push({ category: key, values: [val] })
      }
    }
  })
  return tags
})

// Dynamic Journals
const journals = computed(() => {
  const result: { title: string, text: string }[] = []
  const keys = Object.keys(currentTrade.value)
  
  // Look for specifically named journals to order them logically
  const order = ['before', 'during', 'after', 'review']
  
  order.forEach(type => {
    const key = keys.find(k => k.toLowerCase().includes(type) && isJournalColumn(k))
    if (key && currentTrade.value[key] && typeof currentTrade.value[key] === 'string' && currentTrade.value[key].trim()) {
      result.push({
        title: key,
        text: currentTrade.value[key]
      })
    }
  })
  
  return result
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex bg-black/95 backdrop-blur-sm">
      <!-- Close Button -->
      <button @click="closeModal" class="absolute top-6 right-6 z-50 p-2 bg-black/50 hover:bg-white/10 border border-white/10 rounded-full text-white/70 hover:text-white transition-colors">
        <X class="w-6 h-6" />
      </button>

      <!-- Navigation Overlay -->
      <div class="absolute inset-y-0 left-0 w-24 flex items-center justify-start px-4 z-40">
        <button 
          @click="prevTrade" 
          :class="['p-4 rounded-full bg-black/50 border border-white/10 text-white transition-all', hasPrev ? 'hover:bg-white/20 hover:scale-110 cursor-pointer' : 'opacity-20 cursor-not-allowed']"
        >
          <ChevronLeft class="w-8 h-8" />
        </button>
      </div>
      <div class="absolute inset-y-0 right-0 w-24 flex items-center justify-end px-4 z-40 pointer-events-none">
        <button 
          @click="nextTrade" 
          style="pointer-events: auto;"
          :class="['p-4 rounded-full bg-black/50 border border-white/10 text-white transition-all', hasNext ? 'hover:bg-white/20 hover:scale-110 cursor-pointer' : 'opacity-20 cursor-not-allowed']"
        >
          <ChevronRight class="w-8 h-8" />
        </button>
      </div>

      <div class="flex w-full h-full p-8 pt-12 pb-12 px-24 gap-8">
        <!-- Left Panel: Images (65%) -->
        <div class="w-[65%] h-full flex flex-col relative rounded-2xl overflow-hidden bg-terminal-dark border border-terminal-gray/30 shadow-2xl">
          <!-- Toggle Overlay -->
          <div v-if="hasBothImages" class="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex bg-black/60 backdrop-blur-md p-1 rounded-lg border border-white/10">
            <button 
              @click="imageMode = 'before'"
              :class="['px-6 py-2 rounded-md text-sm font-bold uppercase tracking-widest transition-all', imageMode === 'before' ? 'bg-terminal-highlight text-black' : 'text-white/50 hover:text-white']"
            >
              Before
            </button>
            <button 
              @click="imageMode = 'after'"
              :class="['px-6 py-2 rounded-md text-sm font-bold uppercase tracking-widest transition-all', imageMode === 'after' ? 'bg-terminal-highlight text-black' : 'text-white/50 hover:text-white']"
            >
              After
            </button>
          </div>
          
          <img v-if="activeImage" :src="activeImage" class="w-full h-full object-contain bg-black/50" />
          <div v-else class="w-full h-full flex flex-col items-center justify-center text-white/20 bg-black/50">
            <ImageIcon class="w-16 h-16 opacity-20 mb-4" />
            <span class="text-sm font-bold uppercase tracking-[0.2em] opacity-40">No Image Available</span>
          </div>
        </div>

        <!-- Right Panel: Info (35%) -->
        <div class="w-[35%] h-full flex flex-col bg-terminal-dark/80 border border-terminal-gray/30 rounded-2xl overflow-hidden shadow-2xl">
          <!-- Header -->
          <div class="p-6 border-b border-terminal-gray/30 bg-terminal-black/40 shrink-0">
            <div class="flex justify-between items-start mb-2">
              <div>
                <h2 class="text-3xl font-bold text-terminal-highlight">{{ currentTrade.pair || currentTrade.Pair || 'Unknown Pair' }}</h2>
                <p class="text-xs text-terminal-text/50 font-mono mt-1">{{ currentTrade.date || currentTrade.Date || currentTrade['Created At'] || currentTrade.createdAt }}</p>
              </div>
              <div :class="['px-4 py-2 rounded-lg border text-lg font-bold font-mono', getPnLClass(currentTrade)]">
                {{ formatPnL(currentTrade) }}
              </div>
            </div>
            <div class="flex gap-4 mt-4">
              <span v-if="currentTrade.Action || currentTrade.action" class="text-xs font-bold uppercase tracking-widest text-terminal-text/70">
                <span class="opacity-50">Action:</span> {{ currentTrade.Action || currentTrade.action }}
              </span>
              <span v-if="currentTrade.Status || currentTrade.status" class="text-xs font-bold uppercase tracking-widest text-terminal-text/70">
                <span class="opacity-50">Status:</span> {{ currentTrade.Status || currentTrade.status }}
              </span>
            </div>
          </div>

          <!-- Scrollable Content -->
          <div class="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            
            <!-- Tags -->
            <div v-if="tradeTags.length > 0" class="space-y-4">
              <div v-for="tagGroup in tradeTags" :key="tagGroup.category" class="space-y-2">
                <h4 class="text-[10px] font-bold text-terminal-text/40 uppercase tracking-widest">{{ tagGroup.category }}</h4>
                <div class="flex flex-wrap gap-2">
                  <span v-for="val in tagGroup.values" :key="val" class="px-2.5 py-1 bg-terminal-accent/10 border border-terminal-accent/30 text-terminal-accent rounded-md text-xs font-medium">
                    {{ val }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Journals -->
            <div class="space-y-6 pt-4 border-t border-terminal-gray/20">
              <div v-for="journal in journals" :key="journal.title" class="space-y-2">
                <h4 class="text-[10px] font-bold text-terminal-highlight uppercase tracking-[0.2em] flex items-center gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-terminal-accent"></div>
                  {{ journal.title }}
                </h4>
                <div class="p-4 bg-terminal-black/30 border border-terminal-gray/20 rounded-xl">
                  <p class="text-sm text-terminal-text/90 leading-relaxed whitespace-pre-wrap">{{ journal.text }}</p>
                </div>
              </div>
              
              <div v-if="journals.length === 0" class="text-center py-8 opacity-30 border border-dashed border-terminal-gray/30 rounded-xl">
                <span class="text-xs font-bold uppercase tracking-widest">No Journal Entries</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
