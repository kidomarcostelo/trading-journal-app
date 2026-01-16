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

const PSYCH_SCHEMA = [
  { id: 'Trade Intention', label: 'Trade Intention', candidates: ['Trade Intention', 'Intention'] },
  { id: 'felt rushed to open the trade?', label: 'Rushed Entry?', candidates: ['felt rushed to open the trade?', 'Rushed', 'Impulsive'] },
  { id: 'Anxious during trade', label: 'Anxious?', candidates: ['Anxious during trade', 'Anxiety'] },
  { id: 'Satisfied with result?', label: 'Satisfied?', candidates: ['Satisfied with result?', 'Satisfaction'] },
  { id: 'News Impact', label: 'News Impact', candidates: ['News Impact', 'News'] },
  { id: 'Followed RR?', label: 'Followed RR?', candidates: ['Followed RR?', 'RR'] },
  { id: 'did i out early?', label: 'Exited Early?', candidates: ['did i out early?', 'Early Exit'] }
]

const sourceSections = computed(() => {
  return PSYCH_SCHEMA.map(schema => {
    const match = props.config.find(c => 
      schema.candidates.some(cand => c.id.toLowerCase() === cand.toLowerCase())
    )
    return {
      ...schema,
      actualId: match?.id || schema.id,
      values: match?.values || []
    }
  })
})

// Reordering Logic
const orderedSections = ref<any[]>([])
const draggedItemIndex = ref<number | null>(null)
const dropTargetIndex = ref<number | null>(null)

// Sync with source and restore order
watch(sourceSections, (newSections) => {
  if (typeof window === 'undefined' || newSections.length === 0) {
    orderedSections.value = newSections
    return
  }

  const savedOrder = localStorage.getItem('psychology-order')
  if (savedOrder) {
    try {
      const orderIds = JSON.parse(savedOrder) as string[]
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
  localStorage.setItem('psychology-order', JSON.stringify(ids))
}

const onDragStart = (e: DragEvent, index: number) => {
  draggedItemIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.dropEffect = 'move'
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

const onDragEnter = (index: number) => {
  if (draggedItemIndex.value !== null && draggedItemIndex.value !== index) {
    dropTargetIndex.value = index
  }
}

const onDrop = (index: number) => {
  if (draggedItemIndex.value === null || draggedItemIndex.value === index) return
  
  const itemToMove = orderedSections.value[draggedItemIndex.value]
  const newItems = [...orderedSections.value]
  
  newItems.splice(draggedItemIndex.value, 1)
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
    name="psych-grid" 
    tag="div" 
    class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
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
  </TransitionGroup>
</template>

<style scoped>
.psych-grid-move {
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}
</style>
