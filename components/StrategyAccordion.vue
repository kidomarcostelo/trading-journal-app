<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import CollapsibleSection from './CollapsibleSection.vue'
import ChipSelect from './ChipSelect.vue'
import type { ChipCategory, Trade } from '~/types'

interface Props {
  config: ChipCategory[]
  modelValue: Partial<Trade>
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

// The specific strategy headers requested
const STRATEGY_SCHEMA = [
  { 
    id: 'Strategies', 
    label: 'Strategies', 
    candidates: ['Strategies', 'Strategy'] 
  },
  { 
    id: 'Price Action', 
    label: 'Price Action', 
    candidates: ['Price Action', 'PriceAction', 'PA', 'Setup'] 
  },
  { 
    id: 'HTF: trading with trend? (1d - 1w)', 
    label: 'HTF: trading with trend? (1d - 1w)', 
    candidates: ['HTF: trading with trend? (1d - 1w)', 'HTF', 'Higher Timeframe'] 
  },
  { 
    id: 'MTF: Is the medium trend helping or fighting me? (1hr - 4hr)', 
    label: 'MTF: Is the medium trend helping or fighting me? (1hr - 4hr)', 
    candidates: ['MTF: Is the medium trend helping or fighting me? (1hr - 4hr)', 'MTF', 'Medium Timeframe'] 
  },
  { 
    id: 'LTF: short-term entry context? (mins)', 
    label: 'LTF: short-term entry context? (mins)', 
    candidates: ['LTF: short-term entry context? (mins)', 'LTF', 'Lower Timeframe'] 
  }
]

// Map the requested schema to the actual data found in config
const sourceSections = computed(() => {
  // We map the incoming config (which represents the Sheet column order)
  // but only keep the ones that match our strategy schema.
  return props.config
    .map(c => {
      const schema = STRATEGY_SCHEMA.find(s => 
        s.candidates.some(cand => c.id.toLowerCase() === cand.toLowerCase())
      )
      if (!schema) return null
      return {
        ...schema,
        actualId: c.id,
        values: c.values
      }
    })
    .filter(Boolean) as any[]
})

// Reordering Logic
const orderedSections = ref<any[]>([])
const draggedItemIndex = ref<number | null>(null)

// Sync with source and restore order
watch(sourceSections, (newSections) => {
  if (typeof window === 'undefined' || newSections.length === 0) {
    orderedSections.value = newSections
    return
  }

  const savedOrder = localStorage.getItem('strategy-order')
  if (savedOrder) {
    try {
      const orderIds = JSON.parse(savedOrder) as string[]
      // Sort newSections based on saved IDs
      const sorted = [...newSections].sort((a, b) => {
        const indexA = orderIds.indexOf(a.id)
        const indexB = orderIds.indexOf(b.id)
        if (indexA !== -1 && indexB !== -1) return indexA - indexB
        if (indexA !== -1) return -1
        if (indexB !== -1) return 1
        return 0
      })
      orderedSections.value = sorted
    } catch (e) {
      orderedSections.value = newSections
    }
  } else {
    orderedSections.value = newSections
  }
}, { immediate: true })

const saveOrder = () => {
  const ids = orderedSections.value.map(s => s.id)
  localStorage.setItem('strategy-order', JSON.stringify(ids))
}

const onDragStart = (e: DragEvent, index: number) => {
  draggedItemIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.dropEffect = 'move'
    
    // Slight opacity to indicate dragging, but keep it visible
    const target = e.target as HTMLElement
    setTimeout(() => {
      target.classList.add('opacity-50')
    }, 0)
  }
}

const onDragEnd = (e: DragEvent) => {
  const target = e.target as HTMLElement
  target.classList.remove('opacity-50')
  draggedItemIndex.value = null
  dropTargetIndex.value = null
}

const dropTargetIndex = ref<number | null>(null)

const onDragEnter = (index: number) => {
  if (draggedItemIndex.value !== null && draggedItemIndex.value !== index) {
    dropTargetIndex.value = index
  }
}

const onDrop = (index: number) => {
  if (draggedItemIndex.value === null || draggedItemIndex.value === index) return
  
  const itemToMove = orderedSections.value[draggedItemIndex.value]
  const newItems = [...orderedSections.value]
  
  // Remove from old pos
  newItems.splice(draggedItemIndex.value, 1)
  // Insert at new pos
  newItems.splice(index, 0, itemToMove)
  
  orderedSections.value = newItems
  saveOrder()
}

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
      v-for="(section, index) in orderedSections" 
      :key="section.actualId" 
      class="flex flex-col gap-3 p-4 bg-terminal-black/20 border border-terminal-gray rounded-lg cursor-move hover:border-terminal-accent/30 transition-all active:cursor-grabbing"
      draggable="true"
      @dragstart="onDragStart($event, index)"
      @dragend="onDragEnd"
      @dragover.prevent
      @dragenter.prevent="onDragEnter(index)"
      @drop="onDrop(index)"
      :class="{ 
        'border-violet-500 border-2 bg-violet-500/10': dropTargetIndex === index && draggedItemIndex !== index,
        'opacity-50 border-dashed': draggedItemIndex === index 
      }"
    >
      <!-- Static Header -->
      <div class="flex items-center justify-between border-b border-terminal-gray/30 pb-2 mb-1 pointer-events-none">
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

    <div v-if="orderedSections.length === 0" key="empty" class="col-span-full text-center py-8 text-terminal-text/30 border border-dashed border-terminal-gray rounded-lg">
      <p class="text-xs italic">No matching strategy categories found in configuration.</p>
    </div>
  </TransitionGroup>
</template>

<style scoped>
.strategy-grid-move {
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}
</style>
