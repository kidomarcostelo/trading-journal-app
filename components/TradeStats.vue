<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  trades: any[]
}>()

const stats = computed(() => {
  if (!props.trades || props.trades.length === 0) {
    return { count: 0, pnl: 0, winRate: 0 }
  }

  const count = props.trades.length
  
  const getVal = (obj: any, key: string) => {
    const foundKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase())
    return foundKey ? obj[foundKey] : undefined
  }

  const parsePnL = (val: any): number => {
    if (typeof val === 'number') return val
    if (!val) return 0
    // Remove currency symbols, commas, and spaces
    const clean = String(val).replace(/[^0-9.-]/g, '')
    const num = parseFloat(clean)
    return isNaN(num) ? 0 : num
  }

  // Calculate Total PnL
  const pnl = props.trades.reduce((sum, t) => sum + parsePnL(getVal(t, 'pnl')), 0)

  // Calculate Win Rate (based on CLOSED trades only)
  const closedTrades = props.trades.filter(t => (getVal(t, 'status') || '').toLowerCase() === 'closed')
  const wins = closedTrades.filter(t => parsePnL(getVal(t, 'pnl')) > 0).length
  
  const winRate = closedTrades.length > 0 
    ? (wins / closedTrades.length) * 100 
    : 0

  return {
    count,
    pnl: pnl.toFixed(2),
    winRate: winRate.toFixed(1)
  }
})
</script>

<template>
  <div class="grid grid-cols-3 gap-4">
    <!-- Trades Count -->
    <div class="bg-terminal-black border border-terminal-gray/30 rounded p-3 flex flex-col items-center">
      <span class="text-[10px] uppercase font-bold text-terminal-text/60 tracking-wider">Trades</span>
      <span class="text-xl font-bold text-terminal-highlight">{{ stats.count }}</span>
    </div>

    <!-- Win Rate -->
    <div class="bg-terminal-black border border-terminal-gray/30 rounded p-3 flex flex-col items-center">
      <span class="text-[10px] uppercase font-bold text-terminal-text/60 tracking-wider">Win Rate</span>
      <span class="text-xl font-bold text-emerald-400">{{ stats.winRate }}%</span>
    </div>

    <!-- Total PnL -->
    <div class="bg-terminal-black border border-terminal-gray/30 rounded p-3 flex flex-col items-center">
      <span class="text-[10px] uppercase font-bold text-terminal-text/60 tracking-wider">Total PnL</span>
      <span 
        class="text-xl font-bold"
        :class="Number(stats.pnl) > 0 ? 'text-emerald-400' : Number(stats.pnl) < 0 ? 'text-rose-400' : 'text-terminal-highlight'"
      >
        {{ stats.pnl }}
      </span>
    </div>
  </div>
</template>