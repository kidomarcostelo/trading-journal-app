<script setup lang="ts">
import { computed } from 'vue'
import ChipSelect from './ChipSelect.vue'
import type { ChipCategory, Trade } from '~/types'

interface Props {
  title: string
  categories: string[]
  config: ChipCategory[]
  modelValue: Partial<Trade>
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const orderedSections = computed(() => {
  return props.categories.map(catId => {
    const match = props.config.find(c => c.id === catId)
    if (!match) return null
    return {
      id: catId,
      label: catId,
      values: match.values
    }
  }).filter(Boolean) as any[]
})

const findKey = (obj: any, targetKey: string) => {
  return Object.keys(obj).find(k => k.toLowerCase() === targetKey.toLowerCase())
}

const updateCategory = (actualId: string, newValue: string[]) => {
  const existingKey = findKey(props.modelValue, actualId) || actualId
  const newTrade = { ...props.modelValue, [existingKey]: newValue }
  emit('update:modelValue', newTrade)
}

const getModelValueForCategory = (actualId: string): string[] => {
  const existingKey = findKey(props.modelValue, actualId) || actualId
  const val = props.modelValue[existingKey]
  if (Array.isArray(val)) return val
  if (typeof val === 'string') {
    if (val.includes(',')) {
      return val.split(',').map(s => s.trim()).filter(Boolean)
    }
    return [val]
  }
  return []
}
</script>

<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div 
        v-for="section in orderedSections" 
        :key="section.id" 
        class="flex flex-col gap-3 p-4 bg-terminal-black/20 border border-terminal-gray rounded-lg hover:border-terminal-accent/30 transition-all"
      >
        <div class="flex items-center justify-between border-b border-terminal-gray/30 pb-2 mb-1">
          <span class="text-[10px] font-bold text-terminal-highlight tracking-widest uppercase truncate" :title="section.label">
            {{ section.label }}
          </span>
          <span v-if="getModelValueForCategory(section.id).length > 0" class="text-[10px] text-terminal-accent font-mono bg-terminal-accent/10 px-1.5 py-0.5 rounded-full border border-terminal-accent/20">
              {{ getModelValueForCategory(section.id).length }}
          </span>
        </div>

        <ChipSelect
          label=""
          :options="section.values"
          :modelValue="getModelValueForCategory(section.id)"
          :category="section.id"
          @update:modelValue="(val) => updateCategory(section.id, val)"
        />
      </div>
    </div>

    <div v-if="orderedSections.length === 0" class="text-center py-12 text-terminal-text/20 border border-dashed border-terminal-gray rounded-lg bg-terminal-black/10">
      <p class="text-sm italic">No categories assigned to this panel.</p>
    </div>
  </div>
</template>
