<script lang="ts">
export default {
  name: 'TradeSummaryCard'
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  trade: {
    Pair?: string
    Action?: string
    Market?: string
    Status?: string
    Date?: string
    [key: string]: any
  }
  active?: boolean
  collapsed?: boolean
}>()

const actionClass = computed(() => {
  const v = String(props.trade.Action).toLowerCase()
  if (v === 'long' || v === 'buy') return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
  if (v === 'short' || v === 'sell') return 'text-rose-500 bg-rose-500/10 border-rose-500/20'
  return 'text-terminal-text bg-terminal-gray/20 border-terminal-gray/30'
})

const statusClass = computed(() => {
  const v = String(props.trade.Status).toLowerCase()
  if (v === 'open') return 'border-emerald-500/50 text-emerald-400'
  if (v === 'closed') return 'border-terminal-gray text-terminal-text/60'
  if (v === 'cancelled' || v === 'missed') return 'border-rose-500/30 text-rose-400/60'
  return 'border-terminal-gray text-terminal-text/40'
})

const displayDate = computed(() => {
  const val = props.trade.Date || props.trade['Date Created'] || props.trade['Created At'] || props.trade.date
  
  if (!val) return '--/--/----'

  // Handle Excel Serial Date (e.g. 45985)
  // 25569 is the offset between 1900-01-01 (Excel epoch) and 1970-01-01 (JS epoch)
  if (!isNaN(val) && Number(val) > 20000) {
    const date = new Date((Number(val) - 25569) * 86400 * 1000)
    // Adjust for timezone offset if necessary, but usually UTC conversion is enough for simple dates.
    // However, the serial is usually "local" to the spreadsheet. 
    // We'll use simple UTC parts to avoid timezone shifts changing the day.
    // Or just simple string formatting.
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(date.getUTCDate()).padStart(2, '0')
    const yyyy = date.getUTCFullYear()
    return `${mm}/${dd}/${yyyy}`
  }

  return val
})
</script>

<template>
  <div 
    class="p-3 border-b border-terminal-gray/50 hover:bg-terminal-gray/10 transition-colors cursor-pointer group relative overflow-hidden"
    :class="[
      active ? 'bg-terminal-gray/20' : ''
    ]"
    :title="collapsed ? trade.Pair : ''"
  >
    <div v-if="active" class="absolute left-0 top-0 bottom-0 w-1 bg-terminal-accent"></div>
    
    <div 
      class="grid gap-2 items-center text-[11px]"
      :class="collapsed ? 'grid-cols-1' : 'grid-cols-[1.2fr_0.8fr_1fr_0.8fr_1.2fr]'"
    >
      <!-- Col 1: Pair -->
      <div 
        class="font-bold text-terminal-highlight truncate"
      >
        {{ trade.Pair || 'Untitled' }}
      </div>

      <!-- Col 2: Action -->
      <div v-show="!collapsed">
        <span :class="['px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-tighter', actionClass]">
          {{ trade.Action || '???' }}
        </span>
      </div>

      <!-- Col 3: Market -->
      <div v-show="!collapsed" class="text-terminal-text/60 truncate uppercase tracking-tight">
        {{ trade.Market || '-' }}
      </div>

      <!-- Col 4: Status -->
      <div v-show="!collapsed">
        <span :class="['px-1.5 py-0.5 rounded border text-[9px] font-medium uppercase truncate block text-center', statusClass]">
          {{ trade.Status || 'Unk' }}
        </span>
      </div>

      <!-- Col 5: Date -->
      <div v-show="!collapsed" class="text-right text-terminal-text/60 font-mono text-[10px]">
        {{ displayDate }}
      </div>
    </div>
  </div>
</template>