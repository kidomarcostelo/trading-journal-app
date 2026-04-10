<script setup lang="ts">
import { computed } from 'vue'
import type { Trade } from '~/types'

const props = defineProps<{
  trades: Trade[]
}>()

const heatmapData = computed(() => {
  // Group by Day of Week vs Week of Month or something similar
  // For simplicity, let's do Day of Week (X) vs Market/Month (Y) or just a calendar-like grid
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const data: { name: string, data: { x: string, y: number }[] }[] = []

  // Initialize
  days.forEach(day => {
    data.push({ name: day, data: [] })
  })

  // Group trades by day and calculate total PnL
  // This is a placeholder for a more complex calendar logic
  // For now, let's just show Day of Week performance
  
  const dailyPnL: Record<string, number> = {}
  props.trades.forEach(t => {
    if (!t.pnl || t.status !== 'Closed') return
    const date = new Date(t.date || t.createdAt || '')
    if (isNaN(date.getTime())) return
    
    const dayName = days[date.getDay()]
    dailyPnL[dayName] = (dailyPnL[dayName] || 0) + Number(t.pnl)
  })

  return days.map(day => ({
    name: day,
    data: [{
      x: 'PnL',
      y: Math.round(dailyPnL[day] || 0)
    }]
  }))
})

const chartOptions = computed(() => ({
  chart: {
    type: 'heatmap',
    toolbar: { show: false },
    background: 'transparent',
    foreColor: '#94a3b8'
  },
  dataLabels: { enabled: true },
  colors: ['#10b981'], // Base color, will be shaded
  plotOptions: {
    heatmap: {
      shadeIntensity: 0.5,
      colorScale: {
        ranges: [
          { from: -1000000, to: -1, name: 'Loss', color: '#f43f5e' }, // Rose-500
          { from: 0, to: 0, name: 'B/E', color: '#334155' }, // Zinc-700
          { from: 1, to: 1000000, name: 'Profit', color: '#10b981' } // Emerald-500
        ]
      }
    }
  },
  theme: { mode: 'dark' }
}))
</script>

<template>
  <div class="bg-terminal-black/40 border border-terminal-gray/30 rounded-xl p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xs font-bold uppercase tracking-widest text-terminal-text/40">Daily Performance</h3>
      <div class="text-[10px] text-terminal-text/20 font-mono">PnL by Day of Week</div>
    </div>
    
    <div class="h-[200px]">
      <client-only>
        <apexchart
          height="100%"
          width="100%"
          :options="chartOptions"
          :series="heatmapData"
        />
      </client-only>
    </div>
  </div>
</template>
