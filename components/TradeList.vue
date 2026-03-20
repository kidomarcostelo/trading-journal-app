<script setup lang="ts">
import { toRef, watch } from 'vue'
import { useTrades, type FilterPeriod, type SortField, type SortDir } from '../composables/useTrades'
import TradeSummaryCard from './TradeSummaryCard.vue'

const props = defineProps<{
  trades: any[]
  filterPeriod?: FilterPeriod
  startDate?: string
  endDate?: string
  sortBy?: SortField
  sortDir?: SortDir
  activeId?: string
  collapsed?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
  (e: 'delete', id: string): void
}>()

const { filteredTrades, filterPeriod, startDate, endDate, sortBy, sortDir } = useTrades(toRef(props, 'trades'))

// Helper to get ID consistently
const getTradeId = (trade: any) => {
  return trade.ID || trade.id
}

const isTradeActive = (trade: any) => {
  const tid = getTradeId(trade)
  // Ensure both are treated as strings for comparison
  return tid && String(tid) === String(props.activeId)
}

// Sync props to internal composable state
watch(() => props.filterPeriod, (newVal) => {
  if (newVal) filterPeriod.value = newVal
}, { immediate: true })

watch(() => props.startDate, (newVal) => {
  if (newVal !== undefined) startDate.value = newVal
}, { immediate: true })

watch(() => props.endDate, (newVal) => {
  if (newVal !== undefined) endDate.value = newVal
}, { immediate: true })

watch(() => props.sortBy, (newVal) => {
  if (newVal) sortBy.value = newVal
}, { immediate: true })

watch(() => props.sortDir, (newVal) => {
  if (newVal) sortDir.value = newVal
}, { immediate: true })
</script>

<template>
  <div class="flex flex-col bg-terminal-black h-full overflow-hidden">
    <!-- Header Row -->
    <div 
      class="grid gap-2 border-b border-terminal-gray text-[10px] uppercase tracking-widest font-bold text-terminal-text/40 bg-terminal-black sticky top-0 z-10"
      :class="[
        collapsed ? 'grid-cols-1 py-3 px-1.5' : 'grid-cols-[1.5fr_0.6fr_0.7fr_1.2fr_0.2fr] p-3'
      ]"
    >
      <div>Pair</div>
      <div v-show="!collapsed">Action</div>
      <div v-show="!collapsed" class="text-center">Status</div>
      <div v-show="!collapsed" class="text-right">Date</div>
      <div></div>
    </div>

    <div class="flex-1 overflow-y-auto min-h-0">
      <TradeSummaryCard
        v-for="(trade, index) in filteredTrades"
        :key="getTradeId(trade) || `trade-${index}`"
        :trade="trade"
        :active="isTradeActive(trade)"
        :collapsed="collapsed"
        @click="emit('select', getTradeId(trade))"
        @delete="(id) => emit('delete', id)"
      />
      
      <div v-if="filteredTrades.length === 0" class="py-16 text-center text-terminal-text/40 text-sm">
        <span v-if="!collapsed">No trades found.</span>
        <span v-else class="text-xs">...</span>
      </div>
    </div>
  </div>
</template>