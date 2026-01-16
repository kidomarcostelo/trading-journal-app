<script setup lang="ts">
import { ref, watch } from 'vue'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import ChipSelect from './ChipSelect.vue'
import type { ChipCategory, Trade } from '~/types'

interface Props {
  config: ChipCategory[]
  modelValue: Partial<Trade>
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const expanded = ref<Record<string, boolean>>({})

// Initialize all expanded by default
const initExpanded = () => {
  props.config.forEach(cat => {
    if (expanded.value[cat.id] === undefined) {
      expanded.value[cat.id] = true
    }
  })
}

watch(() => props.config, initExpanded, { immediate: true })

const toggleCategory = (id: string) => {
  expanded.value[id] = !expanded.value[id]
}

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
    <div v-for="category in config" :key="category.id" class="border border-terminal-gray rounded-lg overflow-hidden bg-terminal-dark/30">
      <!-- Header -->
      <button 
        @click="toggleCategory(category.id)"
        class="w-full flex items-center justify-between p-3 bg-terminal-dark hover:bg-terminal-gray/50 transition-colors accordion-header group"
      >
        <div class="flex items-center gap-2">
           <component 
            :is="expanded[category.id] ? ChevronDown : ChevronRight" 
            class="w-4 h-4 text-terminal-text group-hover:text-terminal-highlight"
          />
          <span class="text-sm font-semibold text-terminal-highlight tracking-wide">{{ category.id }}</span>
        </div>
        <!-- Optional: Show count of selected items? -->
        <span v-if="getModelValueForCategory(category.id).length > 0" class="text-xs text-terminal-accent font-mono bg-terminal-accent/10 px-2 py-0.5 rounded-full">
            {{ getModelValueForCategory(category.id).length }}
        </span>
      </button>

      <!-- Content -->
      <div v-if="expanded[category.id]" class="p-3 bg-terminal-black/20 border-t border-terminal-gray">
        <!-- We use ChipSelect but maybe we want to hide its label since the accordion header serves as one?
             ChipSelect renders a label. We can pass an empty string? -->
        <ChipSelect
          label=""
          :options="category.values"
          :modelValue="getModelValueForCategory(category.id)"
          :category="category.id"
          @update:modelValue="(val) => updateCategory(category.id, val)"
        />
      </div>
    </div>
  </div>
</template>
