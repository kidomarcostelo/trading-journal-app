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
}>()

const actionClass = computed(() => {
  const v = String(props.trade.Action).toLowerCase()
  if (v === 'long' || v === 'buy') return 'text-emerald-500 bg-emerald-500/10'
  if (v === 'short' || v === 'sell') return 'text-rose-500 bg-rose-500/10'
  return 'text-terminal-text bg-terminal-gray/20'
})

const statusClass = computed(() => {
  const v = String(props.trade.Status).toLowerCase()
  if (v === 'open') return 'border-emerald-500/50 text-emerald-400'
  if (v === 'closed') return 'border-terminal-gray text-terminal-text/60'
  if (v === 'cancelled' || v === 'missed') return 'border-rose-500/30 text-rose-400/60'
  return 'border-terminal-gray text-terminal-text/40'
})
</script>

<template>
  <div 
    class="p-4 border-b border-terminal-gray hover:bg-terminal-gray/10 transition-colors cursor-pointer group relative"
    :class="active ? 'bg-terminal-gray/20' : ''"
  >
    <div v-if="active" class="absolute left-0 top-0 bottom-0 w-1 bg-terminal-accent"></div>
    
    <div class="flex items-start justify-between mb-2">
      <div class="flex flex-col">
        <span class="font-bold text-terminal-highlight text-sm tracking-tight">{{ trade.Pair || 'Untitled' }}</span>
        <span class="text-[10px] text-terminal-text/40 uppercase tracking-widest font-medium">{{ trade.Market || 'N/A' }}</span>
      </div>
      <span class="text-[10px] text-terminal-text/40 font-mono">{{ trade.Date || '--/--/----' }}</span>
    </div>

    <div class="flex items-center gap-2">
      <span :class="['px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter', actionClass]">
        {{ trade.Action || '???' }}
      </span>
      <span :class="['px-1.5 py-0.5 rounded border text-[9px] font-medium uppercase', statusClass]">
        {{ trade.Status || 'Unknown' }}
      </span>
    </div>
  </div>
</template>