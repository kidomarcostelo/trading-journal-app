<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAnalytics } from '~/composables/useAnalytics'
import type { Trade } from '~/types'
import { AlertCircle, TrendingDown, RefreshCcw, ShieldCheck } from 'lucide-vue-next'

const props = defineProps<{
  trades: Trade[]
  initialBalance?: number
  riskPerTrade?: number
}>()

const { fetchRiskData, calculateMaxDrawdown, calculateMaxConsecutiveLosses } = useAnalytics()

const riskOfRuin = ref<number | null>(null)
const mdd = ref<number | null>(null)
const consecutiveLosses = ref<number>(0)
const isLoading = ref(false)
const error = ref<string | null>(null)

const loadData = async () => {
  if (!props.trades || props.trades.length === 0) return
  
  isLoading.value = true
  error.value = null
  
  try {
    const data = await fetchRiskData(props.initialBalance || 0, props.riskPerTrade || 0.02)
    riskOfRuin.value = data.riskOfRuin
    
    // MDD is calculated from equity curve
    if (data.equityCurve) {
      mdd.value = calculateMaxDrawdown(data.equityCurve)
    }
    
    consecutiveLosses.value = calculateMaxConsecutiveLosses(props.trades)
  } catch (err: any) {
    console.error('[RiskDashboard] Error loading data:', err)
    error.value = 'Failed to load risk data.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadData)
watch(() => props.trades, loadData, { deep: true })

const formatPercent = (val: number | null) => {
  if (val === null) return '--'
  return (val * 100).toFixed(1) + '%'
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <!-- Risk of Ruin -->
    <div class="bg-terminal-black border border-terminal-gray/30 rounded-lg p-4 flex flex-col gap-2">
      <div class="flex items-center gap-2 text-terminal-text/60">
        <ShieldCheck class="w-4 h-4" />
        <span class="text-xs uppercase font-bold tracking-wider">Risk of Ruin</span>
      </div>
      <div v-if="isLoading" class="animate-pulse h-8 w-24 bg-terminal-gray/20 rounded"></div>
      <div v-else-if="error" class="text-rose-400 text-xs flex items-center gap-1">
        <AlertCircle class="w-3 h-3" />
        Error
      </div>
      <div v-else class="text-2xl font-bold font-mono" :class="riskOfRuin && riskOfRuin > 0.1 ? 'text-rose-400' : 'text-emerald-400'">
        {{ riskOfRuin !== null ? (riskOfRuin * 100).toFixed(1) : '0.0' }}%
      </div>
      <p class="text-[10px] text-terminal-text/40 leading-tight">
        Probability of losing your entire account based on current edge.
      </p>
    </div>

    <!-- Max Drawdown -->
    <div class="bg-terminal-black border border-terminal-gray/30 rounded-lg p-4 flex flex-col gap-2">
      <div class="flex items-center gap-2 text-terminal-text/60">
        <TrendingDown class="w-4 h-4" />
        <span class="text-xs uppercase font-bold tracking-wider">Max Drawdown</span>
      </div>
      <div v-if="isLoading" class="animate-pulse h-8 w-24 bg-terminal-gray/20 rounded"></div>
      <div v-else class="text-2xl font-bold font-mono text-rose-400">
        {{ mdd !== null ? mdd.toFixed(1) : '0.0' }}%
      </div>
      <p class="text-[10px] text-terminal-text/40 leading-tight">
        The largest peak-to-trough decline in your equity curve.
      </p>
    </div>

    <!-- Consecutive Losses -->
    <div class="bg-terminal-black border border-terminal-gray/30 rounded-lg p-4 flex flex-col gap-2">
      <div class="flex items-center gap-2 text-terminal-text/60">
        <RefreshCcw class="w-4 h-4" />
        <span class="text-xs uppercase font-bold tracking-wider">Consecutive Losses</span>
      </div>
      <div v-if="isLoading" class="animate-pulse h-8 w-24 bg-terminal-gray/20 rounded"></div>
      <div v-else class="text-2xl font-bold font-mono text-terminal-highlight">
        {{ consecutiveLosses }}
      </div>
      <p class="text-[10px] text-terminal-text/40 leading-tight">
        Longest losing streak. Can you handle another {{ consecutiveLosses }}?
      </p>
    </div>
  </div>
</template>
