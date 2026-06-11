<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { ChipCategory } from '~/types'
import { Save, Loader2, Image as ImageIcon } from 'lucide-vue-next'
import { useSettings } from '~/composables/useSettings'

const props = defineProps<{
  config?: ChipCategory[]
}>()

const emit = defineEmits(['success'])

const { settings } = useSettings()

// Initialize tags based on categories
const categories = computed(() => props.config || [])

const statusOptions = computed(() => {
  const cat = categories.value?.find(c => ['status', 'Status'].includes(c.id))
  let options = cat ? [...cat.values] : ['Open', 'Closed', 'Cancelled', 'Missed']
  
  // Safeguard current value
  if (form.Status && !options.includes(form.Status)) {
    options.push(form.Status)
  }
  return options
})

const actionOptions = computed(() => {
  const actionCat = categories.value?.find(c => ['action', 'Action'].includes(c.id))
  return actionCat ? actionCat.values : ['Long', 'Short']
})

const marketOptions = computed(() => {
  const marketCat = categories.value?.find(c => ['market', 'Market'].includes(c.id))
  return marketCat ? marketCat.values : ['Forex', 'Crypto', 'Indices', 'Stocks', 'Commodities']
})

const initialForm = {
  Pair: '',
  Action: 'Long',
  Market: '',
  Status: 'Open',
  Risk: '',
  PNL: '',
  MAE: '',
  MFE: '',
  'Before Picture': '',
  'Before Journal': ''
}

const form = reactive<any>({ ...initialForm })
const tags = reactive<Record<string, string[]>>({})

// Specific Chip Categories to show in the form
const visibleCategories = computed(() => settings.value?.visibleTradeFormChips || ['Strategies', 'Price Action', 'Trade Intention', 'Emotions'])

// Initialize tags based on categories
watch(() => props.config, (newVal) => {
  if (newVal) {
    newVal.forEach(cat => {
      if (visibleCategories.value.some(allowed => cat.id.toLowerCase().includes(allowed.toLowerCase()))) {
        if (!tags[cat.id]) tags[cat.id] = []
      }
    })
  }
}, { immediate: true })

// Special handling for "Pair" category
const pairCategory = computed(() => {
  return categories.value?.find(c => ['Pairs', 'pairs'].includes(c.id.toLowerCase()))
})

// Filter for requested strategy/psych chips
const filteredCategories = computed(() => {
  return categories.value?.filter(cat => 
    visibleCategories.value.some(allowed => cat.id.toLowerCase() === allowed.toLowerCase())
  ) || []
})

const getCategoryColor = (catId: string) => {
  const id = catId.toLowerCase()
  if (id.includes('strategies')) return 'primary'
  if (id.includes('price action')) return 'info'
  if (id.includes('intention')) return 'success'
  return 'neutral'
}

const isSubmitting = ref(false)
const message = ref({ text: '', type: '' })

const submitTrade = async () => {
  isSubmitting.value = true
  message.value = { text: '', type: '' }

  try {
    // Merge tags into the main form data
    const payload = { ...form }
    Object.keys(tags).forEach(catId => {
      // Don't include the special Pair category from the tags object if it was there
      if (pairCategory.value && catId === pairCategory.value.id) return
      
      if (tags[catId].length > 0) {
        payload[catId] = tags[catId]
      }
    })

    const { data, error } = await useFetch('/api/trades', {
      method: 'POST',
      body: payload
    })

    if (error.value) throw new Error(error.value.message || 'Failed to save trade')

    message.value = { text: 'Trade logged successfully!', type: 'success' }
    Object.assign(form, initialForm)
    Object.keys(tags).forEach(catId => tags[catId] = [])
    emit('success', data.value)
  } catch (err: any) {
    message.value = { text: err.message, type: 'error' }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="bg-terminal-dark h-full">
    <form @submit.prevent="submitTrade" class="flex flex-col h-full">
      <div class="flex flex-1 min-h-0">
        <!-- Left: Inputs (40%) -->
        <div class="w-full md:w-[40%] p-8 space-y-6 border-r border-terminal-gray overflow-y-auto">
          <div v-if="pairCategory">
             <Combobox
               :label="pairCategory.id"
               :options="pairCategory.values"
               v-model="form.Pair"
             />
          </div>
          <div v-else>
            <label class="block text-xs font-medium text-terminal-text/70 mb-1.5 ml-1 uppercase tracking-wider">Pair</label>
            <input
              v-model="form.Pair"
              name="Pair"
              required
              class="w-full bg-terminal-black/50 border border-terminal-gray rounded-lg focus:border-terminal-accent focus:ring-1 focus:ring-terminal-accent/20 text-terminal-highlight px-3 py-2 outline-none font-mono text-sm placeholder-terminal-text/30"
              placeholder="e.g. BTC/USD"
            />
          </div>

          <!-- Action, Market, Status -->
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-[10px] font-bold text-terminal-text/70 mb-1.5 ml-1 uppercase tracking-wider">Action</label>
              <select v-model="form.Action" class="w-full appearance-none bg-terminal-black border border-terminal-gray/30 rounded px-2 py-1.5 text-xs text-terminal-text hover:border-terminal-gray/50 focus:border-terminal-accent focus:outline-none transition-colors cursor-pointer">
                <option v-for="option in actionOptions" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-terminal-text/70 mb-1.5 ml-1 uppercase tracking-wider">Market</label>
              <select v-model="form.Market" class="w-full appearance-none bg-terminal-black border border-terminal-gray/30 rounded px-2 py-1.5 text-xs text-terminal-text hover:border-terminal-gray/50 focus:border-terminal-accent focus:outline-none transition-colors cursor-pointer">
                <option value="" disabled>Select...</option>
                <option v-for="option in marketOptions" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-terminal-text/70 mb-1.5 ml-1 uppercase tracking-wider">Status</label>
              <select v-model="form.Status" class="w-full appearance-none bg-terminal-black border border-terminal-gray/30 rounded px-2 py-1.5 text-xs text-terminal-text hover:border-terminal-gray/50 focus:border-terminal-accent focus:outline-none transition-colors cursor-pointer">
                <option v-for="status in statusOptions" :key="status" :value="status">
                  {{ status }}
                </option>
              </select>
            </div>
          </div>

          <!-- Risk & PNL -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-bold text-terminal-text/70 mb-1.5 ml-1 uppercase tracking-wider">Risk</label>
              <input
                v-model="form.Risk"
                type="number"
                step="any"
                placeholder="0.00"
                class="w-full bg-terminal-black border border-terminal-gray rounded-lg hover:border-terminal-gray/50 focus:border-terminal-accent focus:ring-1 focus:ring-terminal-accent/20 text-terminal-highlight px-3 py-2 outline-none font-mono text-sm transition-all"
              />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-terminal-text/70 mb-1.5 ml-1 uppercase tracking-wider">PNL</label>
              <input
                v-model="form.PNL"
                type="number"
                step="any"
                placeholder="0.00"
                class="w-full bg-terminal-black border border-terminal-gray rounded-lg hover:border-terminal-gray/50 focus:border-terminal-accent focus:ring-1 focus:ring-terminal-accent/20 text-terminal-highlight px-3 py-2 outline-none font-mono text-sm transition-all"
              />
            </div>
          </div>

          <!-- MAE & MFE (Only show if closed) -->
          <div v-if="form.Status === 'Closed'" class="grid grid-cols-2 gap-4 p-4 bg-terminal-black/30 border border-terminal-gray/30 rounded-xl animate-in fade-in slide-in-from-top-1 duration-300">
            <div>
              <label class="block text-[10px] font-bold text-terminal-text/40 mb-1.5 ml-1 uppercase tracking-widest">MAE (Adverse)</label>
              <input
                v-model="form.MAE"
                type="number"
                step="any"
                placeholder="0.00"
                class="w-full bg-terminal-black/50 border border-terminal-gray/50 rounded-lg focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/10 text-rose-400 px-3 py-2 outline-none font-mono text-sm transition-all"
              />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-terminal-text/40 mb-1.5 ml-1 uppercase tracking-widest">MFE (Favorable)</label>
              <input
                v-model="form.MFE"
                type="number"
                step="any"
                placeholder="0.00"
                class="w-full bg-terminal-black/50 border border-terminal-gray/50 rounded-lg focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/10 text-emerald-400 px-3 py-2 outline-none font-mono text-sm transition-all"
              />
            </div>
          </div>



          <!-- Before Picture URL -->
          <div>
            <label class="block text-xs font-medium text-terminal-text/70 mb-1.5 ml-1 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon class="w-3.5 h-3.5" /> Before Picture (URL)
            </label>
            <input
              v-model="form['Before Picture']"
              class="w-full bg-terminal-black border border-terminal-gray rounded-lg hover:border-terminal-gray/50 focus:border-terminal-accent focus:ring-1 focus:ring-terminal-accent/20 text-terminal-highlight px-3 py-2 outline-none font-mono text-xs placeholder-terminal-text/30 transition-all"
              placeholder="Paste snapshot link..."
            />
          </div>

          <!-- Before Journal -->
          <div>
            <label class="block text-xs font-medium text-terminal-text/70 mb-1.5 ml-1 uppercase tracking-wider">Before Journal</label>
            <textarea
              v-model="form['Before Journal']"
              rows="6"
              class="w-full bg-terminal-black border border-terminal-gray rounded-lg hover:border-terminal-gray/50 focus:border-terminal-accent focus:ring-1 focus:ring-terminal-accent/20 text-terminal-highlight px-3 py-3 outline-none text-sm resize-none placeholder-terminal-text/30 leading-relaxed transition-all"
              placeholder="Analysis, setup details, and plan..."
            ></textarea>
          </div>

          <!-- Chips Section -->
          <div v-if="filteredCategories.length > 0" class="space-y-6 pt-6 border-t border-terminal-gray/50">
            <Combobox
              v-for="cat in filteredCategories"
              :key="cat.id"
              :label="cat.id"
              :options="cat.values"
              v-model="tags[cat.id]"
              :multiple="true"
              :color="getCategoryColor(cat.id)"
            />
          </div>
        </div>

        <!-- Right: Image Preview (60%) -->
        <div class="flex-1 bg-terminal-black flex items-center justify-center relative group overflow-hidden">
          <img 
            v-if="form['Before Picture']" 
            :src="form['Before Picture']" 
            class="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-all duration-500" 
            alt="Preview" 
          />
          <div v-else class="flex flex-col items-center gap-3 text-terminal-text/20">
            <div class="p-6 border-2 border-dashed border-terminal-gray/20 rounded-full">
              <ImageIcon class="w-12 h-12 opacity-10" />
            </div>
            <span class="text-xs uppercase font-bold tracking-[0.2em] opacity-30">Image Preview Area</span>
          </div>
          
          <!-- Overlay Label -->
          <div v-if="form['Before Picture']" class="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-md text-[10px] text-white uppercase font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Live Preview
          </div>
        </div>
      </div>

      <!-- Submit Footer -->
      <div class="flex items-center justify-between p-6 border-t border-terminal-gray bg-terminal-black/20">
        <div v-if="message.text" :class="message.type === 'success' ? 'text-emerald-400' : 'text-rose-400'" class="text-sm font-medium flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full" :class="message.type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'"></span>
          {{ message.text }}
        </div>
        <div v-else></div>
        
        <button
          type="submit"
          :disabled="isSubmitting"
          class="bg-terminal-highlight hover:bg-white text-terminal-black border border-transparent font-bold py-2.5 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
        >
          <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
          {{ isSubmitting ? 'Saving...' : 'Confirm Entry' }}
        </button>
      </div>
    </form>
  </div>
</template>
