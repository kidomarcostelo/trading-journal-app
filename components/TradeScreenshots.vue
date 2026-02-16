<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Image as ImageIcon, ExternalLink, FileText, X } from 'lucide-vue-next'

const props = defineProps<{
  trade: any
}>()

const emit = defineEmits<{
  (e: 'update', data: any): void
}>()

// State
const newBeforeImage = ref('')
const newAfterImage = ref('')
const currentBeforeIndex = ref(0)
const currentAfterIndex = ref(0)

// Local form state for journals
const form = ref({ ...props.trade })

// Track the current trade ID to detect changes
const currentTradeId = computed(() => props.trade?.ID || props.trade?.id)

watch(currentTradeId, () => {
  form.value = { ...props.trade }
  // Reset indices when trade changes to avoid persisting from previous trade
  currentBeforeIndex.value = 0
  currentAfterIndex.value = 0
}, { immediate: true })

// Also watch for deep changes if the trade is updated from outside (e.g. autosave)
watch(() => props.trade, (newVal) => {
  if (newVal) {
    form.value = { ...newVal }
  }
}, { deep: true })

const updateJournal = (key: string, value: string) => {
  form.value[key] = value
  // Emit only the changed field to avoid bulk object issues
  emit('update', { [key]: value })
}

const getImages = (type: 'before' | 'after') => {
  const key = Object.keys(props.trade).find(k => 
    k.toLowerCase().includes(type) && /picture|image|img/i.test(k)
  )
  const val = key ? props.trade[key] : []
  if (Array.isArray(val)) return val
  if (typeof val === 'string' && val.trim()) {
    return val.split(',').map(v => v.trim()).filter(v => v)
  }
  return []
}

const findJournalKey = (candidates: string[]) => {
  const existingKey = Object.keys(props.trade).find(k => 
    candidates.some(cand => k.trim().toLowerCase() === cand.trim().toLowerCase())
  )
  if (existingKey) return existingKey
  
  return candidates[0]
}

const beforeImages = computed(() => getImages('before'))
const afterImages = computed(() => getImages('after'))

const beforeJournalKey = computed(() => findJournalKey(['Before Journal', 'BeforeJournal', 'Plan Notes']))
const afterJournalKey = computed(() => findJournalKey(['After Journal', 'AfterJournal', 'Result Notes']))
const duringJournalKey = computed(() => findJournalKey(['During Journal', 'DuringJournal', 'Execution Notes', 'Notes']))

const addImage = (type: 'before' | 'after') => {
  const url = type === 'before' ? newBeforeImage.value : newAfterImage.value
  if (!url.trim()) return

  const currentImages = [...getImages(type)]
  currentImages.push(url.trim())
  
  const key = type === 'before' 
    ? Object.keys(props.trade).find(k => k.toLowerCase().includes('before') && /picture|image|img/i.test(k)) || 'Before Picture'
    : Object.keys(props.trade).find(k => k.toLowerCase().includes('after') && /picture|image|img/i.test(k)) || 'After Picture'

  updateJournal(key, currentImages.join(', '))
  
  if (type === 'before') {
    newBeforeImage.value = ''
    currentBeforeIndex.value = currentImages.length - 1
  } else {
    newAfterImage.value = ''
    currentAfterIndex.value = currentImages.length - 1
  }
}

const removeImage = (type: 'before' | 'after') => {
  const currentImages = [...getImages(type)]
  const index = type === 'before' ? currentBeforeIndex.value : currentAfterIndex.value
  
  currentImages.splice(index, 1)
  
  const key = type === 'before' 
    ? Object.keys(props.trade).find(k => k.toLowerCase().includes('before') && /picture|image|img/i.test(k)) || 'Before Picture'
    : Object.keys(props.trade).find(k => k.toLowerCase().includes('after') && /picture|image|img/i.test(k)) || 'After Picture'

  updateJournal(key, currentImages.join(', '))

  if (type === 'before') {
    if (currentBeforeIndex.value >= currentImages.length) {
      currentBeforeIndex.value = Math.max(0, currentImages.length - 1)
    }
  } else {
    if (currentAfterIndex.value >= currentImages.length) {
      currentAfterIndex.value = Math.max(0, currentImages.length - 1)
    }
  }
}

const nextImage = (type: 'before' | 'after') => {
  if (type === 'before') {
    currentBeforeIndex.value = (currentBeforeIndex.value + 1) % beforeImages.value.length
  } else {
    currentAfterIndex.value = (currentAfterIndex.value + 1) % afterImages.value.length
  }
}

const prevImage = (type: 'before' | 'after') => {
  if (type === 'before') {
    currentBeforeIndex.value = (currentBeforeIndex.value - 1 + beforeImages.value.length) % beforeImages.value.length
  } else {
    currentAfterIndex.value = (currentAfterIndex.value - 1 + afterImages.value.length) % afterImages.value.length
  }
}

const openOriginal = (url: string) => {
  window.open(url, '_blank')
}
</script>

<template>
  <div class="space-y-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Before Column -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold text-terminal-highlight uppercase tracking-wider flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-terminal-accent"></span>
            Before / Setup
          </h4>
          <span class="text-[10px] text-terminal-text/40" v-if="beforeImages.length > 0">
            {{ currentBeforeIndex + 1 }} / {{ beforeImages.length }}
          </span>
        </div>
        
        <div v-if="beforeImages.length > 0" class="relative group border border-terminal-gray rounded-lg overflow-hidden bg-terminal-black flex items-center justify-center min-h-[200px]">
          <img 
            :key="beforeImages[currentBeforeIndex]"
            :src="beforeImages[currentBeforeIndex]" 
            class="w-full h-auto block" 
            alt="Before Setup" 
          />
          
          <!-- Carousel Controls -->
          <div v-if="beforeImages.length > 1" class="absolute inset-0 flex items-center justify-between p-2 pointer-events-none">
            <button 
              @click.stop="prevImage('before')"
              class="p-1.5 bg-black/40 text-white rounded-full hover:bg-black/80 pointer-events-auto transition-all opacity-40 group-hover:opacity-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>

            <button 
              @click.stop="nextImage('before')"
              class="p-1.5 bg-black/40 text-white rounded-full hover:bg-black/80 pointer-events-auto transition-all opacity-40 group-hover:opacity-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>

          <!-- Pagination Dots -->
          <div v-if="beforeImages.length > 1" class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 p-1.5 bg-black/20 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              v-for="(_, i) in beforeImages" 
              :key="i"
              @click="currentBeforeIndex = i"
              class="w-1.5 h-1.5 rounded-full transition-all"
              :class="currentBeforeIndex === i ? 'bg-terminal-accent w-3' : 'bg-white/40 hover:bg-white/60'"
            ></button>
          </div>

          <!-- Top Right Actions -->
          <div class="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              @click="openOriginal(beforeImages[currentBeforeIndex])"
              class="p-1.5 bg-black/60 text-white rounded-md hover:bg-black/80"
              title="Open Original"
            >
              <ExternalLink class="w-4 h-4" />
            </button>
            <button 
              @click="removeImage('before')"
              class="p-1.5 bg-rose-500/80 text-white rounded-md hover:bg-rose-500"
              title="Remove Image"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
        <div v-else class="h-48 border border-dashed border-terminal-gray rounded-lg flex flex-col items-center justify-center text-terminal-text/20">
          <ImageIcon class="w-8 h-8 mb-2 opacity-50" />
          <span class="text-[10px] uppercase font-medium">No Before Images</span>
        </div>

        <!-- Add Image Input -->
        <div class="flex gap-2">
          <input 
            v-model="newBeforeImage"
            @keydown.enter.prevent="addImage('before')"
            type="text" 
            placeholder="Paste image URL..." 
            class="flex-1 bg-terminal-black border border-terminal-gray rounded-md px-3 py-1.5 text-xs text-terminal-text focus:border-terminal-accent outline-none"
          />
          <button 
            @click="addImage('before')"
            class="px-3 py-1.5 bg-terminal-gray/20 hover:bg-terminal-gray/40 border border-terminal-gray rounded-md text-xs font-medium text-terminal-highlight transition-colors"
          >
            Add
          </button>
        </div>

        <!-- Before Journal -->
        <div class="bg-terminal-black/40 border border-terminal-gray/50 rounded-lg p-4 focus-within:border-terminal-accent/50 transition-colors">
          <div class="flex items-center gap-2 mb-2 text-terminal-highlight/60">
            <FileText class="w-3 h-3" />
            <span class="text-[10px] uppercase font-bold tracking-widest">Before Journal</span>
          </div>
          <textarea
            :value="form[beforeJournalKey]"
            @input="updateJournal(beforeJournalKey, ($event.target as HTMLTextAreaElement).value)"
            rows="6"
            class="w-full bg-transparent border-none outline-none text-sm text-terminal-text placeholder-terminal-text/20 resize-y font-sans leading-relaxed"
            placeholder="Add your pre-trade analysis here..."
          ></textarea>
        </div>
      </div>

      <!-- After Column -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold text-terminal-highlight uppercase tracking-wider flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            After / Result
          </h4>
          <span class="text-[10px] text-terminal-text/40" v-if="afterImages.length > 0">
            {{ currentAfterIndex + 1 }} / {{ afterImages.length }}
          </span>
        </div>
        
        <div v-if="afterImages.length > 0" class="relative group border border-terminal-gray rounded-lg overflow-hidden bg-terminal-black flex items-center justify-center min-h-[200px]">
          <img 
            :key="afterImages[currentAfterIndex]"
            :src="afterImages[currentAfterIndex]" 
            class="w-full h-auto block" 
            alt="After Result" 
          />
          
          <!-- Carousel Controls -->
          <div v-if="afterImages.length > 1" class="absolute inset-0 flex items-center justify-between p-2 pointer-events-none">
            <button 
              @click.stop="prevImage('after')"
              class="p-1.5 bg-black/40 text-white rounded-full hover:bg-black/80 pointer-events-auto transition-all opacity-40 group-hover:opacity-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>

            <button 
              @click.stop="nextImage('after')"
              class="p-1.5 bg-black/40 text-white rounded-full hover:bg-black/80 pointer-events-auto transition-all opacity-40 group-hover:opacity-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>

          <!-- Pagination Dots -->
          <div v-if="afterImages.length > 1" class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 p-1.5 bg-black/20 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              v-for="(_, i) in afterImages" 
              :key="i"
              @click="currentAfterIndex = i"
              class="w-1.5 h-1.5 rounded-full transition-all"
              :class="currentAfterIndex === i ? 'bg-emerald-500 w-3' : 'bg-white/40 hover:bg-white/60'"
            ></button>
          </div>

          <!-- Top Right Actions -->
          <div class="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              @click="openOriginal(afterImages[currentAfterIndex])"
              class="p-1.5 bg-black/60 text-white rounded-md hover:bg-black/80"
              title="Open Original"
            >
              <ExternalLink class="w-4 h-4" />
            </button>
            <button 
              @click="removeImage('after')"
              class="p-1.5 bg-rose-500/80 text-white rounded-md hover:bg-rose-500"
              title="Remove Image"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
        <div v-else class="h-48 border border-dashed border-terminal-gray rounded-lg flex flex-col items-center justify-center text-terminal-text/20">
          <ImageIcon class="w-8 h-8 mb-2 opacity-50" />
          <span class="text-[10px] uppercase font-medium">No After Images</span>
        </div>

        <!-- Add Image Input -->
        <div class="flex gap-2">
          <input 
            v-model="newAfterImage"
            @keydown.enter.prevent="addImage('after')"
            type="text" 
            placeholder="Paste image URL..." 
            class="flex-1 bg-terminal-black border border-terminal-gray rounded-md px-3 py-1.5 text-xs text-terminal-text focus:border-terminal-accent outline-none"
          />
          <button 
            @click="addImage('after')"
            class="px-3 py-1.5 bg-terminal-gray/20 hover:bg-terminal-gray/40 border border-terminal-gray rounded-md text-xs font-medium text-terminal-highlight transition-colors"
          >
            Add
          </button>
        </div>

        <!-- After Journal -->
        <div class="bg-terminal-black/40 border border-terminal-gray/50 rounded-lg p-4 focus-within:border-emerald-500/30 transition-colors">
          <div class="flex items-center gap-2 mb-2 text-terminal-highlight/60">
            <FileText class="w-3 h-3" />
            <span class="text-[10px] uppercase font-bold tracking-widest">After Journal</span>
          </div>
          <textarea
            :value="form[afterJournalKey]"
            @input="updateJournal(afterJournalKey, ($event.target as HTMLTextAreaElement).value)"
            rows="6"
            class="w-full bg-transparent border-none outline-none text-sm text-terminal-text placeholder-terminal-text/20 resize-y font-sans leading-relaxed"
            placeholder="Review the outcome here..."
          ></textarea>
        </div>
      </div>
    </div>

    <!-- During Journal (Full Width) -->
    <div class="bg-terminal-black/40 border border-terminal-gray/50 rounded-lg p-6 focus-within:border-terminal-accent/50 transition-colors">
      <div class="flex items-center gap-2 mb-3 text-terminal-highlight/60">
        <FileText class="w-4 h-4" />
        <span class="text-[10px] uppercase font-bold tracking-widest">During Journal</span>
      </div>
      <textarea
        :value="form[duringJournalKey]"
        @input="updateJournal(duringJournalKey, ($event.target as HTMLTextAreaElement).value)"
        rows="4"
        class="w-full bg-transparent border-none outline-none text-sm text-terminal-text placeholder-terminal-text/20 resize-y font-sans leading-relaxed"
        placeholder="Notes on execution, emotions, or management..."
      ></textarea>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
``