<script setup lang="ts">
import { ref, reactive } from 'vue'
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

const isSubmitting = ref(false)
const message = ref({ text: '', type: '' })

const submitTrade = async () => {
  isSubmitting.value = true
  message.value = { text: '', type: '' }

  try {
    // Merge tags into the main form data
    const payload = { ...form }
    Object.keys(tags).forEach(catId => {
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
  <div class="bg-terminal-dark border border-terminal-gray p-6 rounded shadow-xl">
    <div class="flex items-center gap-2 mb-6 border-b border-terminal-accent/20 pb-4">
      <Save class="w-5 h-5 text-terminal-accent" />
      <h2 class="text-xl font-bold text-terminal-accent uppercase tracking-tighter">New Entry</h2>
    </div>

    <form @submit.prevent="submitTrade" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Basic Info -->
        <div class="space-y-4">
          <div>
            <label class="block text-xs uppercase text-terminal-text/50 mb-1 font-mono">Pair</label>
            <input
              v-model="form.Pair"
              name="Pair"
              required
              class="w-full bg-terminal-black border border-terminal-gray focus:border-terminal-accent text-terminal-text px-3 py-2 outline-none font-mono"
              placeholder="e.g. BTC/USD"
            />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs uppercase text-terminal-text/50 mb-1 font-mono">Entry Price</label>
              <input
                v-model="form['Entry Price']"
                type="number"
                step="any"
                class="w-full bg-terminal-black border border-terminal-gray focus:border-terminal-accent text-terminal-text px-3 py-2 outline-none font-mono"
              />
            </div>
            <div>
              <label class="block text-xs uppercase text-terminal-text/50 mb-1 font-mono">Size</label>
              <input
                v-model="form['Size']"
                type="number"
                step="any"
                class="w-full bg-terminal-black border border-terminal-gray focus:border-terminal-accent text-terminal-text px-3 py-2 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs uppercase text-terminal-text/50 mb-1 font-mono">Exit Price</label>
            <input
              v-model="form['Exit Price']"
              type="number"
              step="any"
              class="w-full bg-terminal-black border border-terminal-gray focus:border-terminal-accent text-terminal-text px-3 py-2 outline-none font-mono"
            />
          </div>
        </div>

        <!-- Images & Notes -->
        <div class="space-y-4">
          <div>
            <label class="block text-xs uppercase text-terminal-text/50 mb-1 font-mono">
              <div class="flex items-center gap-1">
                <ImageIcon class="w-3 h-3" /> Before Picture (CSV)
              </div>
            </label>
            <input
              v-model="form['Before Picture']"
              class="w-full bg-terminal-black border border-terminal-gray focus:border-terminal-accent text-terminal-text px-3 py-2 outline-none text-xs"
              placeholder="URL, URL..."
            />
          </div>
          <div>
            <label class="block text-xs uppercase text-terminal-text/50 mb-1 font-mono">
              <div class="flex items-center gap-1">
                <ImageIcon class="w-3 h-3" /> After Picture (CSV)
              </div>
            </label>
            <input
              v-model="form['After Picture']"
              class="w-full bg-terminal-black border border-terminal-gray focus:border-terminal-accent text-terminal-text px-3 py-2 outline-none text-xs"
              placeholder="URL, URL..."
            />
          </div>
          <div>
            <label class="block text-xs uppercase text-terminal-text/50 mb-1 font-mono">Notes</label>
            <textarea
              v-model="form.Notes"
              rows="3"
              class="w-full bg-terminal-black border border-terminal-gray focus:border-terminal-accent text-terminal-text px-3 py-2 outline-none font-mono text-sm resize-none"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Dynamic Chips -->
      <div v-if="!loadingConfig && categories" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-terminal-gray">
        <ChipSelect
          v-for="cat in categories"
          :key="cat.id"
          :label="cat.id"
          :options="cat.values"
          v-model="tags[cat.id]"
        />
      </div>

      <!-- Submit -->
      <div class="flex items-center justify-between pt-6 border-t border-terminal-gray">
        <div v-if="message.text" :class="message.type === 'success' ? 'text-terminal-accent' : 'text-rose-400'" class="text-sm font-mono italic">
          > {{ message.text }}
        </div>
        <div v-else></div>
        
        <button
          type="submit"
          :disabled="isSubmitting"
          class="bg-terminal-accent hover:bg-terminal-accent/80 disabled:opacity-50 text-terminal-black font-bold py-2 px-8 uppercase tracking-widest transition-all flex items-center gap-2"
        >
          <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
          {{ isSubmitting ? 'Processing...' : 'Save Trade' }}
        </button>
      </div>
    </form>
  </div>
</template>
