<script setup lang="ts">
import { Image as ImageIcon, ArrowRight } from 'lucide-vue-next'

const props = defineProps<{
  trades: any[]
}>()

const getPnLClass = (trade: any) => {
  const pnlKey = Object.keys(trade).find(k => k.toLowerCase().includes('pnl') || k.includes('%'))
  if (!pnlKey) return 'text-terminal-text bg-terminal-gray/20 border-terminal-gray/50'
  const val = parseFloat(trade[pnlKey])
  if (val > 0) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
  if (val < 0) return 'text-rose-500 bg-rose-500/10 border-rose-500/20'
  return 'text-terminal-text bg-terminal-gray/20 border-terminal-gray/50'
}

const getBeforeImages = (trade: any) => {
  const key = Object.keys(trade).find(k => k.toLowerCase().includes('before') && /picture|image|img/i.test(k))
  const val = key ? trade[key] : []
  return Array.isArray(val) ? val : (val ? [val] : [])
}

const getAfterImages = (trade: any) => {
  const key = Object.keys(trade).find(k => k.toLowerCase().includes('after') && /picture|image|img/i.test(k))
  const val = key ? trade[key] : []
  return Array.isArray(val) ? val : (val ? [val] : [])
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
    <div 
      v-for="trade in trades" 
      :key="trade.ID" 
      class="bg-terminal-dark border border-terminal-gray rounded-xl overflow-hidden flex flex-col group hover:shadow-md transition-all shadow-sm"
    >
      <!-- Header Info -->
      <div class="p-4 flex items-center justify-between border-b border-terminal-gray/50 bg-terminal-black/20">
        <div>
          <h3 class="font-semibold text-terminal-highlight text-base">{{ trade.Pair || 'Unknown' }}</h3>
          <p class="text-xs text-terminal-text/50 font-mono mt-0.5">{{ trade.Date || trade['Created At'] || 'No Date' }}</p>
        </div>
        <div :class="['px-2.5 py-1 rounded-md border text-xs font-medium font-mono', getPnLClass(trade)]">
          {{ trade.PnL || trade['PnL %'] || '0' }}
        </div>
      </div>

      <!-- Image Comparison -->
      <div class="flex-1 flex bg-terminal-black/50 relative aspect-video">
        <!-- Before -->
        <div class="flex-1 relative border-r border-terminal-gray/50 group/before">
          <img 
            v-if="getBeforeImages(trade).length > 0"
            :src="getBeforeImages(trade)[0]" 
            class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            alt="Before"
          />
          <div v-else class="w-full h-full flex flex-col items-center justify-center text-terminal-text/20">
            <ImageIcon class="w-6 h-6 mb-2 opacity-50" />
            <span class="text-[10px] uppercase font-medium">Before</span>
          </div>
          <div class="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-[10px] text-white rounded-md border border-white/10 font-medium shadow-sm">
            Plan
          </div>
        </div>

        <!-- After -->
        <div class="flex-1 relative group/after">
          <img 
            v-if="getAfterImages(trade).length > 0"
            :src="getAfterImages(trade)[0]" 
            class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            alt="After"
          />
          <div v-else class="w-full h-full flex flex-col items-center justify-center text-terminal-text/20">
            <ImageIcon class="w-6 h-6 mb-2 opacity-50" />
            <span class="text-[10px] uppercase font-medium">After</span>
          </div>
          <div class="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-[10px] text-white rounded-md border border-white/10 font-medium shadow-sm">
            Result
          </div>
        </div>

        <!-- Separator Icon -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="bg-terminal-dark border border-terminal-gray rounded-full p-1.5 shadow-xl">
            <ArrowRight class="w-3.5 h-3.5 text-terminal-text/70" />
          </div>
        </div>
      </div>

      <!-- Footer / Tags -->
      <div class="p-4 bg-terminal-dark flex flex-col gap-3">
        <div class="flex flex-wrap gap-1.5">
          <template v-for="(val, key) in trade">
            <template v-if="Array.isArray(val) && !isImageColumn(key)">
               <span v-for="tag in val" :key="tag" class="px-2 py-0.5 bg-terminal-accent/10 text-terminal-accent text-[10px] rounded-md border border-terminal-accent/20 font-medium">
                 {{ tag }}
               </span>
            </template>
          </template>
        </div>
        <div v-if="trade.Notes" class="text-xs text-terminal-text/60 italic line-clamp-2 leading-relaxed">
           {{ trade.Notes }}
        </div>
      </div>
    </div>

    <div v-if="trades.length === 0" class="col-span-full py-24 text-center text-terminal-text/30 border border-dashed border-terminal-gray rounded-xl">
      <p class="text-sm">Gallery is empty.</p>
    </div>
  </div>
</template>

<script lang="ts">
const isImageColumn = (header: string) => /picture|image|img/i.test(header)
</script>