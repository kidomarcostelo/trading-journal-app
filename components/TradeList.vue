<script setup lang="ts">
import { computed, toRef, watch, ref } from 'vue'
import { Image as ImageIcon } from 'lucide-vue-next'
import { useTrades, type FilterPeriod, type SortField } from '../composables/useTrades'

const props = defineProps<{
  trades: any[]
  filterPeriod?: FilterPeriod
  sortBy?: SortField
}>()

const { filteredTrades, filterPeriod, sortBy } = useTrades(toRef(props, 'trades'))

// Sync props to internal composable state
watch(() => props.filterPeriod, (newVal) => {
  if (newVal) filterPeriod.value = newVal
}, { immediate: true })

watch(() => props.sortBy, (newVal) => {
  if (newVal) sortBy.value = newVal
}, { immediate: true })

const COLUMNS = [
  { key: 'Pair', label: 'Pair', class: 'w-24' },
  { key: 'Date', label: 'Date', class: 'w-24' },
  { key: 'Action', label: 'Action', class: 'w-20' },
  { key: 'Market', label: 'Market', class: 'w-20' },
  { key: 'Status', label: 'Status', class: 'w-24' },
]

const getCellClass = (header: string, value: any) => {
  const h = header.toLowerCase()
  const v = String(value).toLowerCase()
  
  if (h.includes('pnl') || h.includes('%')) {
    if (parseFloat(v) > 0) return 'text-emerald-500 font-bold'
    if (parseFloat(v) < 0) return 'text-rose-500 font-bold'
  }

  if (v === 'long' || v === 'buy') return 'text-emerald-500/80 uppercase text-[10px] font-medium'
  if (v === 'short' || v === 'sell') return 'text-rose-500/80 uppercase text-[10px] font-medium'

  return 'text-terminal-text'
}

const isImageColumn = (header: string) => /picture|image|img/i.test(header)

const formatValue = (header: string, value: any) => {
  if (value === undefined || value === null) return '—'
  
  if (Array.isArray(value)) {
    if (isImageColumn(header)) {
        return `${value.length} IMG`
    }
    return value.join(', ')
  }

  return value
}
</script>

<template>
  <div class="overflow-x-auto border border-terminal-gray rounded-xl bg-terminal-dark shadow-sm">
    <table class="w-full text-left border-collapse font-sans text-xs">
      <thead>
        <tr class="border-b border-terminal-gray bg-terminal-black/20">
          <th 
            v-for="col in COLUMNS" 
            :key="col.key" 
            class="px-4 py-3 font-medium text-terminal-text/60 whitespace-nowrap"
            :class="col.class"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="(trade, idx) in filteredTrades" 
          :key="trade.ID || idx" 
          class="border-b border-terminal-gray/30 hover:bg-terminal-gray/20 transition-colors group cursor-pointer"
        >
          <td 
            v-for="col in COLUMNS" 
            :key="col.key" 
            class="px-4 py-2.5 whitespace-nowrap"
          >
            <div :class="getCellClass(col.key, trade[col.key])" class="flex items-center gap-2">
              <template v-if="isImageColumn(col.key) && Array.isArray(trade[col.key]) && trade[col.key].length > 0">
                <ImageIcon class="w-3.5 h-3.5 text-terminal-text/50" />
                <span>{{ trade[col.key].length }}</span>
              </template>
              <template v-else>
                {{ formatValue(col.key, trade[col.key]) }}
              </template>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div v-if="filteredTrades.length === 0" class="py-16 text-center text-terminal-text/40 text-sm">
      No data records found.
    </div>
  </div>
</template>