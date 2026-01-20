<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import TradeScreenshots from './TradeScreenshots.vue'
import Combobox from './Combobox.vue'
import type { ChipCategory, Trade } from '~/types'

const props = defineProps<{
  trade: any
  config: ChipCategory[]
}>()

const emit = defineEmits<{
  (e: 'update', data: any): void
}>()

// Local form state
const form = ref({ ...props.trade })

watch(() => props.trade, (newVal) => {
  form.value = { ...newVal }
}, { deep: true })

const updateField = (key: string, value: any) => {
  form.value[key] = value
  emit('update', { ...form.value })
}

// Helper to find actual config category by name (or variation)
const findCategory = (candidates: string[]) => {
  return props.config.find(c => 
    candidates.some(cand => c.id.toLowerCase() === cand.toLowerCase())
  )
}

// --- Mental Game Logic ---
// 1. Category Selection (A, B, C Game)
const mentalCategoryConfig = computed(() => findCategory(['Mental Game Category', 'Game']))
const mentalCategoryKey = 'Mental Game Category'

// 2. Dynamic Sub-Options based on selection
const mentalGameOptions = computed(() => {
  const selectedCat = form.value[mentalCategoryKey]
  if (!selectedCat) return []

  // Map selection 'C Game' -> 'Mental C-Game' column
  let lookup = ''
  const val = String(selectedCat).toUpperCase()
  if (val.includes('C')) lookup = 'Mental C-Game'
  else if (val.includes('B')) lookup = 'Mental B-Game'
  else if (val.includes('A')) lookup = 'Mental A-Game'
  
  if (!lookup) return []

  const cat = findCategory([lookup])
  return cat ? cat.values : []
})
const mentalGameKey = 'Mental Game'

// --- Tactical Skill Logic ---
// 1. Category Selection
// The user wants a SEPARATE A/B/C category for Tactical. 
// If it doesn't exist in config, we'll reuse the 'Game' values but store in a separate key.
const tacticalCategoryConfig = computed(() => findCategory(['Tactical Skill Category', 'Tactical Category', 'Game']))
const tacticalCategoryKey = 'Tactical Skill Category' // Explicit separate key

// 2. Dynamic Sub-Options
const tacticalSkillOptions = computed(() => {
  const selectedCat = form.value[tacticalCategoryKey]
  if (!selectedCat) return []

  let lookup = ''
  const val = String(selectedCat).toUpperCase()
  if (val.includes('C')) lookup = 'Tactical C-Game'
  else if (val.includes('B')) lookup = 'Tactical B-Game'
  else if (val.includes('A')) lookup = 'Tactical A-Game'
  
  if (!lookup) return []

  // Try finding the exact match first, then fallbacks
  const cat = findCategory([lookup, lookup.replace('Game', 'Skill')])
  return cat ? cat.values : []
})
const tacticalSkillKey = 'Tactical Skill'
const reviewJournalKey = 'Review Journal'

</script>

<template>
  <div class="space-y-8 pb-12">
    <!-- Grading Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-terminal-black/30 border border-terminal-gray rounded-lg">
      
      <!-- Mental Game -->
      <div class="space-y-4">
        <h3 class="text-sm font-bold text-terminal-highlight uppercase tracking-wider border-b border-terminal-gray/50 pb-2">Mental Game</h3>
        
        <div v-if="mentalCategoryConfig">
          <label class="block text-xs font-medium text-terminal-text/60 mb-1.5">Category (A/B/C)</label>
          <!-- Using standard select for single choice category -->
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="opt in mentalCategoryConfig.values" 
              :key="opt"
              @click="updateField(mentalCategoryKey, opt)"
              class="px-3 py-1.5 rounded-md text-xs font-medium border transition-all"
              :class="form[mentalCategoryKey] === opt 
                ? 'bg-violet-500/20 border-violet-500 text-violet-300' 
                : 'bg-terminal-black border-terminal-gray text-terminal-text hover:border-terminal-text/40'"
            >
              {{ opt }}
            </button>
          </div>
        </div>

        <div>
          <Combobox
            label="Specific Mental Leak/Strength"
            :options="mentalGameOptions"
            :modelValue="form[mentalGameKey]"
            @update:modelValue="(val) => updateField(mentalGameKey, val)"
            :multiple="true"
          />
          <p v-if="mentalGameOptions.length === 0 && form[mentalCategoryKey]" class="text-[10px] text-rose-400 mt-1 italic">
            No tags found for "{{ form[mentalCategoryKey] }}". Check config headers.
          </p>
        </div>
      </div>

      <!-- Tactical Skill -->
      <div class="space-y-4">
        <h3 class="text-sm font-bold text-terminal-highlight uppercase tracking-wider border-b border-terminal-gray/50 pb-2">Tactical Skill</h3>
        
        <div v-if="tacticalCategoryConfig">
          <label class="block text-xs font-medium text-terminal-text/60 mb-1.5">Category (A/B/C)</label>
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="opt in tacticalCategoryConfig.values" 
              :key="opt"
              @click="updateField(tacticalCategoryKey, opt)"
              class="px-3 py-1.5 rounded-md text-xs font-medium border transition-all"
              :class="form[tacticalCategoryKey] === opt 
                ? 'bg-blue-500/20 border-blue-500 text-blue-300' 
                : 'bg-terminal-black border-terminal-gray text-terminal-text hover:border-terminal-text/40'"
            >
              {{ opt }}
            </button>
          </div>
        </div>

        <div>
          <Combobox
            label="Specific Tactical Leak/Strength"
            :options="tacticalSkillOptions"
            :modelValue="form[tacticalSkillKey]"
            @update:modelValue="(val) => updateField(tacticalSkillKey, val)"
            :multiple="true"
          />
          <p v-if="tacticalSkillOptions.length === 0 && form[tacticalCategoryKey]" class="text-[10px] text-rose-400 mt-1 italic">
            No tags found for "{{ form[tacticalCategoryKey] }}". Check config headers.
          </p>
        </div>
      </div>
    </div>

    <!-- Reused Screenshot/Journal Component -->
    <TradeScreenshots 
      :trade="trade" 
      @update="(data) => emit('update', data)" 
    />

    <!-- Review Journal (Full Width) -->
    <div class="bg-terminal-black/40 border border-terminal-gray/50 rounded-lg p-6 focus-within:border-terminal-accent/50 transition-colors">
      <div class="flex items-center gap-2 mb-3 text-terminal-highlight/60">
        <FileText class="w-4 h-4" />
        <span class="text-[10px] uppercase font-bold tracking-widest">Review Journal</span>
      </div>
      <textarea
        :value="form[reviewJournalKey]"
        @input="updateField(reviewJournalKey, ($event.target as HTMLTextAreaElement).value)"
        rows="8"
        class="w-full bg-transparent border-none outline-none text-sm text-terminal-text placeholder-terminal-text/20 resize-y font-sans leading-relaxed"
        placeholder="Final reflections, takeaways, or post-mortem analysis..."
      ></textarea>
    </div>
  </div>
</template>
