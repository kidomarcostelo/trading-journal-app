<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { LayoutDashboard, BarChart3, TrendingUp, RefreshCw } from 'lucide-vue-next'
import type { Trade } from '~/types'
import AnalyticsDashboard from '~/components/AnalyticsDashboard.vue'
import PairSidebar from '~/components/PairSidebar.vue'
import PairGallery from '~/components/PairGallery.vue'
import CalendarRange from '~/components/CalendarRange.vue'
import { useAnalytics } from '~/composables/useAnalytics'

const { data: trades, refresh, pending } = useFetch<Trade[]>('/api/trades')
const tradesList = computed(() => trades.value || [])

const activeTab = ref<'overview' | 'pair'>('overview')
const selectedPair = ref<string>('')
const startDate = ref('')
const endDate = ref('')

const dateRange = computed(() => {
  if (!startDate.value && !endDate.value) return 'All Time'
  return { 
    start: startDate.value ? new Date(startDate.value) : null, 
    end: endDate.value ? new Date(endDate.value) : null 
  }
})

const { getPairStats, getTopProfitablePairs, filterTradesByTimeframe } = useAnalytics()

const uniquePairs = computed(() => {
  const pairs = new Set<string>()
  tradesList.value.forEach(t => {
    const pair = t.pair || t.Pair
    if (pair) pairs.add(String(pair))
  })
  return Array.from(pairs).sort()
})

const pairCounts = computed(() => {
  const counts: Record<string, number> = {}
  const timeFiltered = filterTradesByTimeframe(tradesList.value, dateRange.value)
  timeFiltered.forEach(t => {
    const pair = String(t.pair || t.Pair || 'Unknown')
    counts[pair] = (counts[pair] || 0) + 1
  })
  return counts
})

// Ensure a selected pair if there are pairs and none selected
watch(uniquePairs, (newPairs) => {
  if (newPairs.length > 0 && !selectedPair.value) {
    selectedPair.value = newPairs[0]
  }
}, { immediate: true })

const topProfitablePairs = computed(() => {
  return getTopProfitablePairs(tradesList.value, dateRange.value, 10)
})

const pairStats = computed(() => {
  if (!selectedPair.value) return null
  return getPairStats(tradesList.value, selectedPair.value, dateRange.value)
})

const selectedPairTrades = computed(() => {
  if (!selectedPair.value) return []
  const timeFiltered = filterTradesByTimeframe(tradesList.value, dateRange.value)
  return timeFiltered.filter(t => (t.pair === selectedPair.value || t.Pair === selectedPair.value))
})
</script>

<template>
  <main class="flex-1 bg-terminal-dark overflow-y-auto">
    <div class="max-w-[1600px] mx-auto p-6 md:p-12 pb-32">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div class="space-y-1">
          <div class="flex items-center gap-3 text-terminal-accent mb-2">
            <BarChart3 class="w-5 h-5" />
            <span class="text-xs font-bold uppercase tracking-widest">Performance Insights</span>
          </div>
          <h1 class="text-4xl font-bold text-terminal-highlight tracking-tight">Analytics Dashboard</h1>
          <p class="text-terminal-text/50">Comprehensive statistical analysis of your trading performance.</p>
        </div>
        
        <div class="flex flex-wrap items-center gap-4">
          <CalendarRange v-model:start-date="startDate" v-model:end-date="endDate" />
          
          <button 
            @click="refresh()" 
            :disabled="pending"
            class="p-2.5 bg-terminal-black border border-terminal-gray/30 rounded-lg text-terminal-text/60 hover:text-terminal-highlight hover:border-terminal-accent/50 transition-all disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw :class="['w-5 h-5', pending ? 'animate-spin' : '']" />
          </button>
          
          <NuxtLink 
            to="/dashboard" 
            class="px-6 py-2.5 bg-terminal-highlight text-terminal-black font-bold rounded-lg hover:bg-white transition-all flex items-center gap-2"
          >
            <LayoutDashboard class="w-4 h-4" /> Go to Trade Log
          </NuxtLink>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex items-center gap-2 mb-8 border-b border-terminal-gray/30 pb-px">
        <button
          @click="activeTab = 'overview'"
          class="px-4 py-2.5 text-sm font-bold tracking-wide transition-colors relative"
          :class="activeTab === 'overview' ? 'text-terminal-highlight' : 'text-terminal-text/50 hover:text-terminal-text'"
        >
          Overview
          <div v-if="activeTab === 'overview'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-terminal-accent shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
        </button>
        <button
          @click="activeTab = 'pair'"
          class="px-4 py-2.5 text-sm font-bold tracking-wide transition-colors relative flex items-center gap-2"
          :class="activeTab === 'pair' ? 'text-terminal-highlight' : 'text-terminal-text/50 hover:text-terminal-text'"
        >
          Pair Analysis
          <div v-if="activeTab === 'pair'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-terminal-accent shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
        </button>
      </div>

      <!-- Top 10 Profitable Highlight (Only in Pair Analysis) -->
      <div v-if="activeTab === 'pair' && topProfitablePairs.length > 0" class="mb-6 p-4 bg-terminal-black/40 border border-terminal-gray/30 rounded-xl">
        <div class="flex items-center gap-3 mb-4">
          <TrendingUp class="w-5 h-5 text-emerald-400" />
          <h3 class="text-xs font-bold text-terminal-text/60 uppercase tracking-widest">Top 10 Profitable Pairs</h3>
        </div>
        <div class="flex flex-wrap gap-3">
          <div 
            v-for="(pair, index) in topProfitablePairs" 
            :key="pair.pair"
            class="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg cursor-pointer hover:bg-emerald-500/20 transition-colors"
            @click="selectedPair = pair.pair"
            title="Click to analyze pair"
          >
            <span class="text-xs font-bold text-emerald-500/50">#{{ index + 1 }}</span>
            <span class="text-sm font-bold text-emerald-400">{{ pair.pair }}</span>
            <div class="flex items-center gap-1.5 ml-1">
              <span class="text-sm font-mono text-terminal-highlight">+{{ pair.pnl }}</span>
              <span class="text-[10px] font-mono text-terminal-text/40">({{ pair.count }})</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div v-if="pending" class="flex flex-col items-center justify-center py-32 space-y-4 opacity-50">
        <RefreshCw class="w-12 h-12 animate-spin text-terminal-accent" />
        <p class="text-xs font-bold uppercase tracking-[0.3em] animate-pulse">Loading Intelligence...</p>
      </div>

      <div v-else-if="tradesList.length > 0" class="animate-in fade-in slide-in-from-bottom-2 duration-700">
        <div v-if="activeTab === 'overview'">
          <AnalyticsDashboard :trades="filterTradesByTimeframe(tradesList, dateRange)" />
        </div>
        
        <div v-else class="flex flex-col lg:flex-row gap-6 h-[800px] border border-terminal-gray/30 rounded-2xl overflow-hidden bg-terminal-black/40">
          <PairSidebar 
            :pairs="uniquePairs" 
            :counts="pairCounts"
            :selectedPair="selectedPair" 
            @select="selectedPair = $event" 
          />
          <div class="flex-1 flex flex-col overflow-y-auto">
            <!-- Selected Pair Stats Header -->
            <div v-if="pairStats" class="p-6 border-b border-terminal-gray/30 bg-terminal-dark grid grid-cols-3 gap-6 sticky top-0 z-10 shadow-sm">
              <div>
                <p class="text-xs text-terminal-text/50 uppercase tracking-widest font-bold">Selected Pair</p>
                <p class="text-2xl font-bold text-terminal-highlight">{{ selectedPair }}</p>
              </div>
              <div>
                <p class="text-xs text-terminal-text/50 uppercase tracking-widest font-bold">Win Rate</p>
                <p :class="['text-2xl font-bold', pairStats.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400']">{{ pairStats.winRate }}%</p>
              </div>
              <div>
                <p class="text-xs text-terminal-text/50 uppercase tracking-widest font-bold">Net PnL & Trades</p>
                <div class="flex items-baseline gap-2">
                  <p :class="['text-2xl font-bold', pairStats.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400']">{{ pairStats.pnl >= 0 ? '+' : '' }}{{ pairStats.pnl }}</p>
                  <p class="text-sm font-mono text-terminal-text/40">({{ pairStats.count }} trades)</p>
                </div>
              </div>
            </div>
            
            <PairGallery :trades="selectedPairTrades" />
          </div>
        </div>
      </div>

      <div v-else class="py-32 text-center border-2 border-dashed border-terminal-gray/20 rounded-2xl opacity-30 flex flex-col items-center gap-4">
        <TrendingUp class="w-12 h-12" />
        <div>
          <p class="text-lg font-medium">No trade data available.</p>
          <p class="text-sm">Log some trades in the dashboard to generate analytics.</p>
        </div>
      </div>
    </div>
  </main>
</template>
