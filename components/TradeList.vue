<script setup lang="ts">
import { computed } from 'vue'
import { Image as ImageIcon, ExternalLink } from 'lucide-vue-next'

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
    if (parseFloat(v) > 0) return 'text-emerald-400 font-bold'
    if (parseFloat(v) < 0) return 'text-rose-400 font-bold'
  }

  if (v === 'long' || v === 'buy') return 'text-emerald-400/80 uppercase text-[10px]'
  if (v === 'short' || v === 'sell') return 'text-rose-400/80 uppercase text-[10px]'

  return 'text-terminal-text/80'
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
  <div class="overflow-x-auto border border-terminal-gray rounded bg-terminal-dark/50">
    <table class="w-full text-left border-collapse font-mono text-xs">
      <thead>
        <tr class="border-b border-terminal-gray bg-terminal-black">
          <th 
            v-for="header in headers" 
            :key="header" 
            class="px-4 py-3 uppercase tracking-widest text-terminal-text/40 font-bold whitespace-nowrap"
          >
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="(trade, idx) in trades" 
          :key="trade.ID || idx" 
          class="border-b border-terminal-gray/30 hover:bg-terminal-accent/5 transition-colors group"
        >
          <td 
            v-for="header in headers" 
            :key="header" 
            class="px-4 py-2 whitespace-nowrap"
          >
            <div :class="getCellClass(header, trade[header])" class="flex items-center gap-2">
              <template v-if="isImageColumn(header) && Array.isArray(trade[header]) && trade[header].length > 0">
                <ImageIcon class="w-3 h-3 opacity-50" />
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
    
    <div v-if="trades.length === 0" class="py-12 text-center text-terminal-text/30 italic">
      NO DATA RECORDS FOUND
    </div>
  </div>
</template>

<style scoped>
/* Ensure the table stays dense */
td, th {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
</style>
