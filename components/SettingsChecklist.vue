<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Trash2, Save, Loader2, AlertCircle } from 'lucide-vue-next'
import { useSettings } from '~/composables/useSettings'
import { useToast } from '~/composables/useToast'
import type { ChecklistRule, TierThreshold } from '~/types'

const { checklistRules, tierThresholds, isLoading, saveChecklistConfig } = useSettings()
const { addToast } = useToast()

const localRules = ref<ChecklistRule[]>([])
const localTiers = ref<TierThreshold[]>([])

onMounted(() => {
  // Deep clone to avoid mutating global state until saved
  localRules.value = JSON.parse(JSON.stringify(checklistRules.value || []))
  localTiers.value = JSON.parse(JSON.stringify(tierThresholds.value || []))
})

const addRule = () => {
  localRules.value.push({ description: '', weight: 1, isMandatory: false })
}

const removeRule = (index: number) => {
  localRules.value.splice(index, 1)
}

const addTier = () => {
  localTiers.value.push({ label: '', threshold: 10 })
}

const removeTier = (index: number) => {
  localTiers.value.splice(index, 1)
}

const handleSave = async () => {
  try {
    // Basic validation
    if (localRules.value.some(r => !r.description.trim())) {
      addToast({ title: 'Validation Error', message: 'All rules must have a description.', type: 'error' })
      return
    }
    if (localTiers.value.some(t => !t.label.trim())) {
      addToast({ title: 'Validation Error', message: 'All tiers must have a label.', type: 'error' })
      return
    }

    // Sort tiers descending by threshold for logical consistency
    const sortedTiers = [...localTiers.value].sort((a, b) => b.threshold - a.threshold)

    await saveChecklistConfig(localRules.value, sortedTiers)
    addToast({ title: 'Success', message: 'Checklist configuration saved successfully.', type: 'success' })
    
    // Update local state with sorted
    localTiers.value = sortedTiers
  } catch (error: any) {
    addToast({ title: 'Error', message: error.message || 'Failed to save configuration.', type: 'error' })
  }
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
    
    <!-- Rules Configuration -->
    <div class="bg-terminal-black/40 border border-terminal-gray/30 rounded-xl p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-lg font-bold tracking-wide text-terminal-highlight">Checklist Rules</h3>
          <p class="text-sm text-terminal-text/50">Define the rules you use to evaluate your setups. Assign weights and mark absolute requirements.</p>
        </div>
        <button 
          @click="addRule"
          class="flex items-center gap-2 px-4 py-2 bg-terminal-black border border-terminal-gray/30 rounded-lg hover:border-terminal-accent hover:text-terminal-highlight transition-colors text-sm font-bold"
        >
          <Plus class="w-4 h-4" /> Add Rule
        </button>
      </div>

      <div v-if="localRules.length === 0" class="py-8 text-center border-2 border-dashed border-terminal-gray/20 rounded-xl opacity-50">
        <p class="text-sm">No rules configured yet.</p>
      </div>

      <div v-else class="space-y-4">
        <div 
          v-for="(rule, index) in localRules" 
          :key="index"
          class="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-terminal-dark/50 border border-terminal-gray/20 rounded-lg group"
        >
          <!-- Description -->
          <div class="flex-1 w-full">
            <label class="block text-xs font-bold text-terminal-text/50 uppercase tracking-widest mb-1">Description</label>
            <input 
              v-model="rule.description" 
              type="text" 
              placeholder="e.g., Clear HTF Trend" 
              class="w-full bg-terminal-black border border-terminal-gray/30 rounded-md px-3 py-2 text-sm text-terminal-text focus:border-terminal-accent focus:ring-1 focus:ring-terminal-accent/30 outline-none transition-all"
            />
          </div>

          <!-- Weight -->
          <div class="w-full sm:w-24">
            <label class="block text-xs font-bold text-terminal-text/50 uppercase tracking-widest mb-1">Weight</label>
            <input 
              v-model.number="rule.weight" 
              type="number" 
              step="1"
              class="w-full bg-terminal-black border border-terminal-gray/30 rounded-md px-3 py-2 text-sm text-terminal-text focus:border-terminal-accent focus:ring-1 focus:ring-terminal-accent/30 outline-none transition-all"
            />
          </div>

          <!-- Mandatory -->
          <div class="w-full sm:w-32 flex items-center justify-between sm:justify-center gap-2 pt-1 sm:pt-5">
            <label class="flex items-center gap-2 cursor-pointer group/label">
              <input 
                v-model="rule.isMandatory" 
                type="checkbox" 
                class="sr-only"
              />
              <div class="w-4 h-4 rounded border border-terminal-gray/50 flex items-center justify-center transition-colors group-hover/label:border-terminal-accent" :class="{ 'bg-terminal-accent/20 border-terminal-accent': rule.isMandatory }">
                <div v-if="rule.isMandatory" class="w-2 h-2 rounded-sm bg-terminal-accent"></div>
              </div>
              <span class="text-sm select-none" :class="rule.isMandatory ? 'text-terminal-highlight' : 'text-terminal-text/70'">Mandatory</span>
            </label>
          </div>

          <!-- Remove -->
          <div class="pt-1 sm:pt-5">
            <button 
              @click="removeRule(index)"
              class="p-2 text-rose-500/50 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
              title="Remove Rule"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tiers Configuration -->
    <div class="bg-terminal-black/40 border border-terminal-gray/30 rounded-xl p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-lg font-bold tracking-wide text-terminal-highlight">Tier Thresholds</h3>
          <p class="text-sm text-terminal-text/50">Define the score thresholds required to achieve specific setup tiers.</p>
        </div>
        <button 
          @click="addTier"
          class="flex items-center gap-2 px-4 py-2 bg-terminal-black border border-terminal-gray/30 rounded-lg hover:border-terminal-accent hover:text-terminal-highlight transition-colors text-sm font-bold"
        >
          <Plus class="w-4 h-4" /> Add Tier
        </button>
      </div>

      <div v-if="localTiers.length === 0" class="py-8 text-center border-2 border-dashed border-terminal-gray/20 rounded-xl opacity-50">
        <p class="text-sm">No tiers configured yet.</p>
      </div>

      <div v-else class="space-y-4">
        <div class="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-400/90 mb-4">
          <AlertCircle class="w-4 h-4 shrink-0" />
          <span>Tiers will be automatically sorted by threshold from highest to lowest upon saving.</span>
        </div>

        <div 
          v-for="(tier, index) in localTiers" 
          :key="index"
          class="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-terminal-dark/50 border border-terminal-gray/20 rounded-lg"
        >
          <!-- Label -->
          <div class="flex-1 w-full">
            <label class="block text-xs font-bold text-terminal-text/50 uppercase tracking-widest mb-1">Tier Label</label>
            <input 
              v-model="tier.label" 
              type="text" 
              placeholder="e.g., S Tier" 
              class="w-full bg-terminal-black border border-terminal-gray/30 rounded-md px-3 py-2 text-sm text-terminal-text focus:border-terminal-accent focus:ring-1 focus:ring-terminal-accent/30 outline-none transition-all"
            />
          </div>

          <!-- Threshold -->
          <div class="w-full sm:w-48">
            <label class="block text-xs font-bold text-terminal-text/50 uppercase tracking-widest mb-1">Minimum Score</label>
            <input 
              v-model.number="tier.threshold" 
              type="number" 
              step="1"
              class="w-full bg-terminal-black border border-terminal-gray/30 rounded-md px-3 py-2 text-sm text-terminal-text focus:border-terminal-accent focus:ring-1 focus:ring-terminal-accent/30 outline-none transition-all"
            />
          </div>

          <!-- Remove -->
          <div class="pt-1 sm:pt-5">
            <button 
              @click="removeTier(index)"
              class="p-2 text-rose-500/50 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
              title="Remove Tier"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end pt-4 border-t border-terminal-gray/30">
      <button
        @click="handleSave"
        :disabled="isLoading"
        class="flex items-center gap-2 px-6 py-2.5 bg-terminal-highlight text-terminal-black font-bold rounded-lg hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
        <Save v-else class="w-4 h-4" />
        Save Configuration
      </button>
    </div>

  </div>
</template>