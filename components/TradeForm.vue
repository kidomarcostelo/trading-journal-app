<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { ChipCategory } from '~/types'
import { Save, Loader2, Image as ImageIcon } from 'lucide-vue-next'

const emit = defineEmits(['success'])

const { data: categories, pending: loadingConfig } = await useFetch<ChipCategory[]>('/api/config')

const initialForm = {
  Pair: '',
  'Entry Price': '',
  'Exit Price': '',
  'Size': '',
  'Notes': '',
  'Before Picture': '',
  'After Picture': '',
}

const form = reactive<any>({ ...initialForm })
const tags = reactive<Record<string, string[]>>({})

// Initialize tags based on categories
if (categories.value) {
  categories.value.forEach(cat => {
    tags[cat.id] = []
  })
}

// Special handling for "Pair" category if it exists
const pairCategory = computed(() => {
  return categories.value?.find(c => ['pair', 'pairs'].includes(c.id.toLowerCase()))
})

// Filter out Pair from the bottom list
const otherCategories = computed(() => {
  return categories.value?.filter(c => !['pair', 'pairs'].includes(c.id.toLowerCase())) || []
})

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
  <div class="bg-terminal-dark border border-terminal-gray p-8 rounded-xl shadow-lg shadow-black/20">
    <div class="flex items-center gap-3 mb-8 border-b border-terminal-gray/50 pb-6">
      <div class="p-2 bg-terminal-black border border-terminal-gray rounded-lg">
        <Save class="w-5 h-5 text-terminal-accent" />
      </div>
      <div>
        <h2 class="text-lg font-semibold text-terminal-highlight">Log Entry</h2>
        <p class="text-xs text-terminal-text/60">Capture trade details</p>
      </div>
    </div>

    <form @submit.prevent="submitTrade" class="space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Basic Info -->
        <div class="space-y-6">
          <!-- Pair Input: Dynamic Combobox or Fallback Text -->
          <div v-if="pairCategory">
             <Combobox
               :label="pairCategory.id"
               :options="pairCategory.values"
               v-model="form.Pair"
             />
          </div>
          <div v-else>
            <label class="block text-xs font-medium text-terminal-text/70 mb-1.5 ml-1">Pair</label>
            <input
              v-model="form.Pair"
              name="Pair"
              required
              class="w-full bg-terminal-black/50 border border-terminal-gray rounded-lg focus:border-terminal-accent focus:ring-1 focus:ring-terminal-accent/20 text-terminal-highlight px-3 py-2 outline-none font-mono text-sm placeholder-terminal-text/30"
              placeholder="e.g. BTC/USD"
            />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-terminal-text/70 mb-1.5 ml-1">Entry Price</label>
              <input
                v-model="form['Entry Price']"
                type="number"
                step="any"
                class="w-full bg-terminal-black/50 border border-terminal-gray rounded-lg focus:border-terminal-accent focus:ring-1 focus:ring-terminal-accent/20 text-terminal-highlight px-3 py-2 outline-none font-mono text-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-terminal-text/70 mb-1.5 ml-1">Size</label>
              <input
                v-model="form['Size']"
                type="number"
                step="any"
                class="w-full bg-terminal-black/50 border border-terminal-gray rounded-lg focus:border-terminal-accent focus:ring-1 focus:ring-terminal-accent/20 text-terminal-highlight px-3 py-2 outline-none font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-terminal-text/70 mb-1.5 ml-1">Exit Price</label>
            <input
              v-model="form['Exit Price']"
              type="number"
              step="any"
              class="w-full bg-terminal-black/50 border border-terminal-gray rounded-lg focus:border-terminal-accent focus:ring-1 focus:ring-terminal-accent/20 text-terminal-highlight px-3 py-2 outline-none font-mono text-sm"
            />
          </div>
        </div>

        <!-- Images & Notes -->
        <div class="space-y-6">
          <div>
            <label class="block text-xs font-medium text-terminal-text/70 mb-1.5 ml-1">
              <div class="flex items-center gap-1.5">
                <ImageIcon class="w-3.5 h-3.5" /> Before Image (URL)
              </div>
            </label>
            <input
              v-model="form['Before Picture']"
              class="w-full bg-terminal-black/50 border border-terminal-gray rounded-lg focus:border-terminal-accent focus:ring-1 focus:ring-terminal-accent/20 text-terminal-highlight px-3 py-2 outline-none text-xs font-mono placeholder-terminal-text/30"
              placeholder="Paste image link..."
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-terminal-text/70 mb-1.5 ml-1">
              <div class="flex items-center gap-1.5">
                <ImageIcon class="w-3.5 h-3.5" /> After Image (URL)
              </div>
            </label>
            <input
              v-model="form['After Picture']"
              class="w-full bg-terminal-black/50 border border-terminal-gray rounded-lg focus:border-terminal-accent focus:ring-1 focus:ring-terminal-accent/20 text-terminal-highlight px-3 py-2 outline-none text-xs font-mono placeholder-terminal-text/30"
              placeholder="Paste image link..."
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-terminal-text/70 mb-1.5 ml-1">Notes</label>
            <textarea
              v-model="form.Notes"
              rows="4"
              class="w-full bg-terminal-black/50 border border-terminal-gray rounded-lg focus:border-terminal-accent focus:ring-1 focus:ring-terminal-accent/20 text-terminal-highlight px-3 py-2 outline-none text-sm resize-none placeholder-terminal-text/30"
              placeholder="Strategy execution details..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Dynamic Comboboxes for Categories -->
      <div v-if="!loadingConfig && otherCategories" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-terminal-gray/50">
        <Combobox
          v-for="cat in otherCategories"
          :key="cat.id"
          :label="cat.id"
          :options="cat.values"
          v-model="tags[cat.id]"
          :multiple="true"
        />
      </div>

      <!-- Submit -->
      <div class="flex items-center justify-between pt-8 border-t border-terminal-gray/50">
        <div v-if="message.text" :class="message.type === 'success' ? 'text-emerald-400' : 'text-rose-400'" class="text-sm font-medium flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full" :class="message.type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'"></span>
          {{ message.text }}
        </div>
        <div v-else></div>
        
        <button
          type="submit"
          :disabled="isSubmitting"
          class="bg-terminal-highlight hover:bg-white text-terminal-black border border-transparent font-semibold py-2.5 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
          {{ isSubmitting ? 'Saving...' : 'Save Trade' }}
        </button>
      </div>
    </form>
  </div>
</template>