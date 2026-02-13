<script setup lang="ts">
import { computed } from 'vue'
import ChipSelect from './ChipSelect.vue'
import { useSettings } from '~/composables/useSettings'
import type { ChipCategory, Trade } from '~/types'

interface Props {
  config: ChipCategory[]
  modelValue: Partial<Trade>
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const { settings } = useSettings()

const orderedSections = computed(() => {
  const strategyLayout = settings.value?.strategy || []
  
  return strategyLayout.map(id => {
    const match = props.config.find(c => c.id === id)
    if (!match) return null
    return {
      id,
      label: id,
      actualId: id,
      values: match.values
    }
  }).filter(Boolean) as any[]
})

const updateCategory = (actualId: string, newValue: string[]) => {
  const newTrade = { ...props.modelValue, [actualId]: newValue }
  emit('update:modelValue', newTrade)
}

const getModelValueForCategory = (actualId: string): string[] => {
  const val = props.modelValue[actualId]
  if (Array.isArray(val)) return val
  if (typeof val === 'string') return [val]
  return []
}
</script>

<template>
  <TransitionGroup 
    name="strategy-grid" 
    tag="div" 
    class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4"
  >
    <div 
      v-for="section in orderedSections" 
      :key="section.actualId" 
      class="flex flex-col gap-3 p-4 bg-terminal-black/20 border border-terminal-gray rounded-lg hover:border-terminal-accent/30 transition-all"
    >
      <!-- Static Header -->
      <div class="flex items-center justify-between border-b border-terminal-gray/30 pb-2 mb-1">
        <span class="text-[10px] font-bold text-terminal-highlight tracking-widest uppercase truncate" :title="section.label">
          {{ section.label }}
        </span>
        <span v-if="getModelValueForCategory(section.actualId).length > 0" class="text-[10px] text-terminal-accent font-mono bg-terminal-accent/10 px-1.5 py-0.5 rounded-full border border-terminal-accent/20">
            {{ getModelValueForCategory(section.actualId).length }}
        </span>
      </div>

      <ChipSelect
        label=""
        :options="section.values"
        :modelValue="getModelValueForCategory(section.actualId)"
        :category="section.actualId"
        @update:modelValue="(val) => updateCategory(section.actualId, val)"
      />
    </div>

    <div v-if="orderedSections.length === 0" key="empty" class="col-span-full text-center py-12 text-terminal-text/30 border border-dashed border-terminal-gray rounded-lg bg-terminal-black/10">
      <p class="text-sm italic mb-2">No strategy categories configured.</p>
      <NuxtLink to="/settings" class="text-xs text-terminal-accent hover:underline">Configure layout in Settings</NuxtLink>
    </div>
  </TransitionGroup>
</template>

<style scoped>
.strategy-grid-move {
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}
</style>