<script setup lang="ts">
import { ref, watch } from 'vue'
import CollapsibleSection from './CollapsibleSection.vue'
import ChipSelect from './ChipSelect.vue'
import type { ChipCategory, Trade } from '~/types'

interface Props {
  config: ChipCategory[]
  modelValue: Partial<Trade>
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const updateCategory = (categoryId: string, newValue: string[]) => {
  const newTrade = { ...props.modelValue, [categoryId]: newValue }
  emit('update:modelValue', newTrade)
}

const getModelValueForCategory = (categoryId: string): string[] => {
  const val = props.modelValue[categoryId]
  if (Array.isArray(val)) return val
  if (typeof val === 'string') return [val]
  return []
}
</script>

<template>
  <div class="space-y-4">
    <CollapsibleSection 
      v-for="category in config" 
      :key="category.id" 
      :title="category.id"
    >
      <template #header-right>
        <span v-if="getModelValueForCategory(category.id).length > 0" class="text-xs text-terminal-accent font-mono bg-terminal-accent/10 px-2 py-0.5 rounded-full">
            {{ getModelValueForCategory(category.id).length }}
        </span>
      </template>

      <ChipSelect
        label=""
        :options="category.values"
        :modelValue="getModelValueForCategory(category.id)"
        :category="category.id"
        @update:modelValue="(val) => updateCategory(category.id, val)"
      />
    </CollapsibleSection>
  </div>
</template>
