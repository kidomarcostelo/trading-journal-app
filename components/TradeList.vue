<script setup lang="ts">
import { computed } from 'vue'
import { Image as ImageIcon } from 'lucide-vue-next'

const props = defineProps<{
  trades: any[]
}>()

const headers = computed(() => {
  if (props.trades.length === 0) return []
  return Object.keys(props.trades[0])
})

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
            v-for="header in headers" 
            :key="header" 
            class="px-4 py-3 font-medium text-terminal-text/60 whitespace-nowrap"
          >
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="(trade, idx) in trades" 
          :key="trade.ID || idx" 
          class="border-b border-terminal-gray/30 hover:bg-terminal-gray/20 transition-colors group"
        >
          <td 
            v-for="header in headers" 
            :key="header" 
            class="px-4 py-2.5 whitespace-nowrap"
          >
            <div :class="getCellClass(header, trade[header])" class="flex items-center gap-2">
              <template v-if="isImageColumn(header) && Array.isArray(trade[header]) && trade[header].length > 0">
                <ImageIcon class="w-3.5 h-3.5 text-terminal-text/50" />
                <span>{{ trade[header].length }}</span>
              </template>
              <template v-else>
                {{ formatValue(header, trade[header]) }}
              </template>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div v-if="trades.length === 0" class="py-16 text-center text-terminal-text/40 text-sm">
      No data records found.
    </div>
  </div>
</template>