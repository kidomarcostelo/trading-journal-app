<script setup lang="ts">
import { computed } from 'vue'
import type { Trade } from '~/types'
import { useAnalytics } from '~/composables/useAnalytics'
import { useDuration } from '~/composables/useDuration'
import RiskDashboard from './RiskDashboard.vue'

const props = defineProps<{
  trades: Trade[]
}>()

const { 
  calculateProfitFactor, 
  calculateWinRate, 
  calculateExpectancy, 
  calculateAverageRMultiple,
  calculateAverageHoldingTime 
} = useAnalytics()

const { formatDuration } = useDuration()

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
</template>
