<script setup lang="ts">
import { toRef, watch } from 'vue'
import { useTrades, type FilterPeriod, type SortField } from '../composables/useTrades'
import TradeSummaryCard from './TradeSummaryCard.vue'

const props = defineProps<{
  trades: any[]
  filterPeriod?: FilterPeriod
  sortBy?: SortField
  activeId?: string
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
}>()

const { filteredTrades, filterPeriod, sortBy } = useTrades(toRef(props, 'trades'))

// Sync props to internal composable state
watch(() => props.filterPeriod, (newVal) => {
  if (newVal) filterPeriod.value = newVal
}, { immediate: true })

watch(() => props.sortBy, (newVal) => {
  if (newVal) sortBy.value = newVal
}, { immediate: true })
</script>

<template>
  <div class="flex flex-col bg-terminal-black">
    <TradeSummaryCard
      v-for="trade in filteredTrades"
      :key="trade.ID"
      :trade="trade"
      :active="activeId === trade.ID"
      @click="emit('select', trade.ID)"
    />
    
    <div v-if="filteredTrades.length === 0" class="py-16 text-center text-terminal-text/40 text-sm">
      No trades found.
    </div>
  </div>
</template>