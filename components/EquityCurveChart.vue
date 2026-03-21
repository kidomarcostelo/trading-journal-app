<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  data: { date: string, equity: number }[]
}>()

const series = computed(() => [{
  name: 'Equity',
  data: props.data.map(item => item.equity)
}])

const chartOptions = computed(() => ({
  chart: {
    type: 'line',
    toolbar: { show: false },
    zoom: { enabled: false },
    background: 'transparent',
    foreColor: '#94a3b8' // Zinc-400
  },
  colors: ['#10b981'], // Emerald-500
  stroke: {
    curve: 'smooth',
    width: 3
  },
  grid: {
    borderColor: '#334155', // Zinc-700
    strokeDashArray: 4
  },
  xaxis: {
    categories: props.data.map(item => item.date),
    labels: {
      rotate: -45,
      style: { fontSize: '10px' }
    },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: {
      formatter: (val: number) => `$${val.toLocaleString()}`,
      style: { fontSize: '10px' }
    }
  },
  tooltip: {
    theme: 'dark',
    x: { show: true },
    y: {
      formatter: (val: number) => `$${val.toLocaleString()}`
    }
  },
  theme: {
    mode: 'dark'
  }
}))
</script>

<template>
  <div class="bg-terminal-black/40 border border-terminal-gray/30 rounded-xl p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xs font-bold uppercase tracking-widest text-terminal-text/40">Equity Curve</h3>
      <div class="text-[10px] text-terminal-text/20 font-mono">Real-time performance</div>
    </div>
    
    <div class="h-[300px]">
      <client-only>
        <apexchart
          height="100%"
          width="100%"
          :options="chartOptions"
          :series="series"
        />
      </client-only>
    </div>
  </div>
</template>
