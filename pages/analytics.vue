<script setup lang="ts">
import { ref, computed } from 'vue'
import { LayoutDashboard, BarChart3, TrendingUp, Filter, RefreshCw } from 'lucide-vue-next'
import type { Trade } from '~/types'
import AnalyticsDashboard from '~/components/AnalyticsDashboard.vue'

const { data: trades, refresh, pending } = useFetch<Trade[]>('/api/trades')

const tradesList = computed(() => trades.value || [])
</script>

<template>
  <main class="flex-1 bg-terminal-dark overflow-y-auto">
    <div class="max-w-[1600px] mx-auto p-12 pb-32">
      <!-- Header -->
      <div class="flex items-center justify-between mb-12">
        <div class="space-y-1">
          <div class="flex items-center gap-3 text-terminal-accent mb-2">
            <BarChart3 class="w-5 h-5" />
            <span class="text-xs font-bold uppercase tracking-widest">Performance Insights</span>
          </div>
          <h1 class="text-4xl font-bold text-terminal-highlight tracking-tight">Analytics Dashboard</h1>
          <p class="text-terminal-text/50">Comprehensive statistical analysis of your trading performance.</p>
        </div>
        
        <div class="flex items-center gap-4">
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

      <!-- Main Content -->
      <div v-if="pending" class="flex flex-col items-center justify-center py-32 space-y-4 opacity-50">
        <RefreshCw class="w-12 h-12 animate-spin text-terminal-accent" />
        <p class="text-xs font-bold uppercase tracking-[0.3em] animate-pulse">Loading Intelligence...</p>
      </div>

      <div v-else-if="tradesList.length > 0" class="animate-in fade-in slide-in-from-bottom-2 duration-700">
        <AnalyticsDashboard :trades="tradesList" />
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
