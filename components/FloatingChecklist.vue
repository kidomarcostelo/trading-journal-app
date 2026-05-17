<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CheckCircle2, ShieldAlert, ClipboardCheck } from 'lucide-vue-next'
import { useSettings } from '~/composables/useSettings'

const props = defineProps<{
  modelValue: string[] 
  strategy?: string | string[] 
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
  (e: 'update:score', score: number): void
  (e: 'update:tier', tier: string | null): void
  (e: 'update:isValid', isValid: boolean): void
}>()

const { strategyChecklists } = useSettings()

const currentStrategy = computed(() => {
  if (!props.strategy) return 'Default'
  if (Array.isArray(props.strategy)) return props.strategy[0] || 'Default'
  return props.strategy
})

const activeConfig = computed(() => {
  return strategyChecklists.value[currentStrategy.value] || strategyChecklists.value['Default'] || { rules: [], tiers: [] }
})

const checklistRules = computed(() => activeConfig.value.rules || [])
const tierThresholds = computed(() => activeConfig.value.tiers || [])

const checkedRules = ref<Set<string>>(new Set(props.modelValue))

watch(() => props.modelValue, (newVal) => {
  checkedRules.value = new Set(newVal)
}, { deep: true })

const toggleRule = (description: string) => {
  const newSet = new Set(checkedRules.value)
  if (newSet.has(description)) {
    newSet.delete(description)
  } else {
    newSet.add(description)
  }
  checkedRules.value = newSet
  emit('update:modelValue', Array.from(newSet))
}

const currentScore = computed(() => {
  return checklistRules.value.reduce((score, rule) => {
    if (checkedRules.value.has(rule.description)) {
      return score + rule.weight
    }
    return score
  }, 0)
})

const missingMandatoryRules = computed(() => {
  return checklistRules.value.filter(rule => rule.isMandatory && !checkedRules.value.has(rule.description))
})

const isValid = computed(() => {
  if (checkedRules.value.size === 0) return true 
  return missingMandatoryRules.value.length === 0
})

const currentTier = computed(() => {
  if (checkedRules.value.size === 0 || !isValid.value || !tierThresholds.value || tierThresholds.value.length === 0) return null
  
  const sortedTiers = [...tierThresholds.value].sort((a, b) => b.threshold - a.threshold)
  
  for (const tier of sortedTiers) {
    if (currentScore.value >= tier.threshold) {
      return tier.label
    }
  }
  return null 
})

watch([currentScore, currentTier, isValid], () => {
  emit('update:score', currentScore.value)
  emit('update:tier', currentTier.value)
  emit('update:isValid', isValid.value)
}, { immediate: true })

</script>

<template>
  <div class="bg-terminal-black/90 backdrop-blur-md border border-terminal-gray/40 rounded-xl overflow-hidden shadow-2xl flex flex-col w-80 max-h-[500px]">
    <div class="p-4 border-b border-terminal-gray/30 bg-terminal-dark/50 shrink-0 flex items-center justify-between">
      <h3 class="text-sm font-bold tracking-wide text-terminal-highlight flex items-center gap-2">
        <ClipboardCheck class="w-4 h-4" /> Entry Checklist
      </h3>
      <span class="text-[10px] font-bold uppercase tracking-widest text-terminal-text/40 bg-terminal-black/50 px-2 py-0.5 rounded border border-terminal-gray/20">
        {{ currentStrategy }}
      </span>
    </div>

    <div v-if="!checklistRules || checklistRules.length === 0" class="p-8 text-center text-terminal-text/50">
      <p class="text-sm">No checklist rules configured.</p>
    </div>

    <div v-else class="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-3">
      <label 
        v-for="rule in checklistRules" 
        :key="rule.description"
        class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-terminal-gray/10 group"
        :class="checkedRules.has(rule.description) ? 'border-terminal-accent/30 bg-terminal-accent/5' : 'border-terminal-gray/20 bg-terminal-black/30'"
      >
        <div class="pt-0.5">
          <input 
            type="checkbox" 
            class="hidden"
            :checked="checkedRules.has(rule.description)"
            @change="toggleRule(rule.description)"
          />
          <div 
            class="w-4 h-4 rounded border flex items-center justify-center transition-colors group-hover:border-terminal-accent"
            :class="checkedRules.has(rule.description) ? 'bg-terminal-accent/20 border-terminal-accent' : 'border-terminal-gray/50'"
          >
            <div v-if="checkedRules.has(rule.description)" class="w-2 h-2 rounded-sm bg-terminal-accent"></div>
          </div>
        </div>
        
        <div class="flex-1 min-w-0">
          <p class="text-sm text-terminal-text group-hover:text-white transition-colors">
            {{ rule.description }}
          </p>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-[10px] font-mono font-bold" :class="rule.weight >= 0 ? 'text-emerald-500/70' : 'text-rose-500/70'">
              {{ rule.weight >= 0 ? '+' : '' }}{{ rule.weight }} pts
            </span>
            <span v-if="rule.isMandatory" class="text-[9px] font-bold uppercase tracking-widest text-rose-400 px-1.5 py-0.5 bg-rose-400/10 rounded-sm">
              Mandatory
            </span>
          </div>
        </div>
      </label>
    </div>

    <div v-if="checklistRules && checklistRules.length > 0" class="p-4 border-t border-terminal-gray/30 bg-terminal-dark/80 shrink-0">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-bold text-terminal-text/50 uppercase tracking-widest">Total Score</span>
        <span class="text-lg font-mono font-bold text-terminal-highlight">Score: {{ currentScore }}</span>
      </div>

      <div v-if="!isValid" class="flex items-start gap-2 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg">
        <ShieldAlert class="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
        <div class="text-xs text-rose-300">
          <span class="font-bold">Missing Mandatory Rules:</span>
          <ul class="list-disc list-inside ml-4 mt-1 opacity-80">
            <li v-for="rule in missingMandatoryRules" :key="rule.description">{{ rule.description }}</li>
          </ul>
        </div>
      </div>
      
      <div v-else-if="currentTier" class="flex items-center justify-center p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
        <span class="text-sm font-bold text-emerald-400">Classified as: <span class="text-white">{{ currentTier }}</span></span>
      </div>
      
      <div v-else class="flex items-center justify-center p-2.5 bg-terminal-gray/10 border border-terminal-gray/20 rounded-lg">
        <span class="text-xs font-bold text-terminal-text/50 uppercase tracking-widest">No tier reached</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
</style>