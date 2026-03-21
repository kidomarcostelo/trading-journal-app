<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import type { Trade } from '~/types'
import { useAnalytics } from '~/composables/useAnalytics'
import { useDuration } from '~/composables/useDuration'
import { useToast } from '~/composables/useToast'
import RiskDashboard from './RiskDashboard.vue'
import EquityCurveChart from './EquityCurveChart.vue'
import PerformanceHeatmap from './PerformanceHeatmap.vue'
import { Database, RefreshCw } from 'lucide-vue-next'

const props = defineProps<{
  trades: Trade[]
}>()

const { 
  calculateProfitFactor, 
  calculateWinRate, 
  calculateExpectancy, 
  calculateAverageRMultiple,
  calculateAverageHoldingTime,
  fetchRiskData
} = useAnalytics()

const { formatDuration } = useDuration()
const { addToast } = useToast()

const isBackfilling = ref(false)
const equityCurve = ref<{ date: string, equity: number }[]>([])

const loadRiskData = async () => {
  try {
    const data = await fetchRiskData(10000, 0.02)
    if (data.equityCurve) {
      equityCurve.value = data.equityCurve
    }
  } catch (err) {
    console.error('Failed to load equity curve:', err)
  }
}

onMounted(loadRiskData)
watch(() => props.trades, loadRiskData, { deep: true })

const handleBackfill = async () => {
  isBackfilling.value = true
  try {
    const result = await $fetch<{ success: boolean, processed: number, totalFound: number }>('/api/trades/backfill', {
      method: 'POST'
    })
    
    if (result.success) {
      addToast({
        title: 'Backfill Complete',
        message: `Successfully processed ${result.processed} trades.`,
        type: 'success'
      })
    }
  } catch (err: any) {
    addToast({
      title: 'Backfill Failed',
      message: err.message || 'An error occurred during backfill.',
      type: 'error'
    })
  } finally {
    isBackfilling.value = false
  }
}

const metrics = computed(() => {
  const profitFactor = calculateProfitFactor(props.trades)
  const winRate = calculateWinRate(props.trades)
  const expectancy = calculateExpectancy(props.trades)
  const avgR = calculateAverageRMultiple(props.trades)
  const avgHold = calculateAverageHoldingTime(props.trades)

  return {
    profitFactor,
    winRate,
    expectancy,
    avgR,
    avgHold
  }
})
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <!-- Profit Factor -->
    <div class="bg-terminal-black border border-terminal-gray/30 p-4 rounded-lg">
      <div class="text-xs text-terminal-text/60 uppercase tracking-wider mb-1">Profit Factor</div>
      <div class="text-2xl font-bold" :class="metrics.profitFactor >= 2 ? 'text-emerald-400' : metrics.profitFactor >= 1 ? 'text-terminal-highlight' : 'text-rose-400'">
        {{ metrics.profitFactor }}
      </div>
    </div>

    <!-- Win Rate -->
    <div class="bg-terminal-black border border-terminal-gray/30 p-4 rounded-lg">
      <div class="text-xs text-terminal-text/60 uppercase tracking-wider mb-1">Win Rate</div>
      <div class="text-2xl font-bold" :class="metrics.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'">
        {{ metrics.winRate }}%
      </div>
    </div>

    <!-- Expectancy -->
    <div class="bg-terminal-black border border-terminal-gray/30 p-4 rounded-lg">
      <div class="text-xs text-terminal-text/60 uppercase tracking-wider mb-1">Expectancy</div>
      <div class="text-2xl font-bold" :class="metrics.expectancy > 0 ? 'text-emerald-400' : 'text-rose-400'">
        {{ metrics.expectancy }}
      </div>
    </div>

    <!-- Avg R-Multiple -->
    <div class="bg-terminal-black border border-terminal-gray/30 p-4 rounded-lg">
      <div class="text-xs text-terminal-text/60 uppercase tracking-wider mb-1">Avg R-Multiple</div>
      <div class="text-2xl font-bold text-terminal-highlight">
        {{ metrics.avgR }}R
      </div>
    </div>

    <!-- Avg Holding Time (Win) -->
    <div class="bg-terminal-black border border-terminal-gray/30 p-4 rounded-lg">
      <div class="text-xs text-terminal-text/60 uppercase tracking-wider mb-1">Avg Hold (Win)</div>
      <div class="text-lg font-medium text-emerald-400/80">
        {{ formatDuration(metrics.avgHold.wins) }}
      </div>
    </div>

    <!-- Avg Holding Time (Loss) -->
    <div class="bg-terminal-black border border-terminal-gray/30 p-4 rounded-lg">
      <div class="text-xs text-terminal-text/60 uppercase tracking-wider mb-1">Avg Hold (Loss)</div>
      <div class="text-lg font-medium text-rose-400/80">
        {{ formatDuration(metrics.avgHold.losses) }}
      </div>
    </div>
  </div>

  <div class="mt-8 pt-8 border-t border-terminal-gray/20">
    <h3 class="text-xs font-bold uppercase tracking-widest text-terminal-text/40 mb-4 ml-1">Risk & Drawdown</h3>
    <RiskDashboard :trades="props.trades" :initial-balance="10000" :risk-per-trade="0.02" />
  </div>

  <!-- Charts -->
  <div class="mt-8 pt-8 border-t border-terminal-gray/20 grid grid-cols-1 lg:grid-cols-2 gap-6">
    <EquityCurveChart :data="equityCurve" />
    <PerformanceHeatmap :trades="props.trades" />
  </div>

  <!-- Actions -->
  <div class="mt-8 pt-8 border-t border-terminal-gray/20 flex flex-col gap-4">
    <h3 class="text-xs font-bold uppercase tracking-widest text-terminal-text/40 ml-1">Data Management</h3>
    <div class="bg-terminal-black/40 border border-terminal-gray/30 rounded-xl p-6 flex items-center justify-between group hover:border-terminal-accent/30 transition-all">
      <div class="flex items-center gap-4">
        <div class="p-3 bg-terminal-black border border-terminal-gray rounded-lg group-hover:border-terminal-accent transition-colors">
          <Database class="w-5 h-5 text-terminal-highlight" />
        </div>
        <div>
          <h4 class="text-sm font-bold text-terminal-highlight">Backfill MAE/MFE</h4>
          <p class="text-xs text-terminal-text/40 leading-relaxed max-w-md">
            Automatically fetch historical market data from Yahoo Finance to calculate Maximum Adverse Excursion and Maximum Favorable Excursion for closed trades.
          </p>
        </div>
      </div>
      <button 
        @click="handleBackfill" 
        :disabled="isBackfilling"
        class="px-6 py-2.5 bg-terminal-accent/10 hover:bg-terminal-accent/20 border border-terminal-accent/30 hover:border-terminal-accent/50 text-terminal-accent text-xs font-bold uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
      >
        <RefreshCw :class="['w-4 h-4', isBackfilling ? 'animate-spin' : '']" />
        {{ isBackfilling ? 'Processing...' : 'Run Backfill' }}
      </button>
    </div>
  </div>
</template>
