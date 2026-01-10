<script setup lang="ts">
import { Image as ImageIcon, ArrowRight } from 'lucide-vue-next'

const props = defineProps<{
  trades: any[]
}>()

const getPnLClass = (trade: any) => {
  const pnlKey = Object.keys(trade).find(k => k.toLowerCase().includes('pnl') || k.includes('%'))
  if (!pnlKey) return 'text-terminal-text'
  const val = parseFloat(trade[pnlKey])
  if (val > 0) return 'text-emerald-400 bg-emerald-900/20 border-emerald-500/50'
  if (val < 0) return 'text-rose-400 bg-rose-900/20 border-rose-500/50'
  return 'text-terminal-text bg-terminal-gray border-terminal-gray'
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
  <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
    <div 
      v-for="trade in trades" 
      :key="trade.ID" 
      class="bg-terminal-dark border border-terminal-gray rounded overflow-hidden flex flex-col group hover:border-terminal-accent/30 transition-all shadow-xl"
    >
      <!-- Header Info -->
      <div class="p-4 flex items-center justify-between border-b border-terminal-gray bg-terminal-black/50">
        <div>
          <h3 class="font-bold text-terminal-accent uppercase tracking-tighter text-lg">{{ trade.Pair || 'UNKNOWN' }}</h3>
          <p class="text-[10px] text-terminal-text/40 font-mono">{{ trade.Date || trade['Created At'] || 'NO DATE' }}</p>
        </div>
        <div :class="['px-3 py-1 rounded border text-xs font-bold font-mono', getPnLClass(trade)]">
          {{ trade.PnL || trade['PnL %'] || '0' }}
        </div>
      </div>

      <!-- Image Comparison -->
      <div class="flex-1 flex bg-terminal-black relative aspect-video">
        <!-- Before -->
        <div class="flex-1 relative border-r border-terminal-gray/50 group/before">
          <img 
            v-if="getBeforeImages(trade).length > 0"
            :src="getBeforeImages(trade)[0]" 
            class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            alt="Before"
          />
          <div v-else class="w-full h-full flex flex-col items-center justify-center text-terminal-text/20">
            <ImageIcon class="w-8 h-8 mb-2" />
            <span class="text-[10px] uppercase">No Before Img</span>
          </div>
          <div class="absolute top-2 left-2 px-2 py-0.5 bg-terminal-black/80 text-[10px] text-terminal-accent uppercase border border-terminal-accent/30 font-bold">
            Before
          </div>
        </div>

        <!-- After -->
        <div class="flex-1 relative group/after">
          <img 
            v-if="getAfterImages(trade).length > 0"
            :src="getAfterImages(trade)[0]" 
            class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            alt="After"
          />
          <div v-else class="w-full h-full flex flex-col items-center justify-center text-terminal-text/20">
            <ImageIcon class="w-8 h-8 mb-2" />
            <span class="text-[10px] uppercase">No After Img</span>
          </div>
          <div class="absolute top-2 right-2 px-2 py-0.5 bg-terminal-black/80 text-[10px] text-terminal-text uppercase border border-terminal-gray font-bold">
            After
          </div>
        </div>

        <!-- Separator Icon -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="bg-terminal-black border border-terminal-gray rounded-full p-1 shadow-2xl">
            <ArrowRight class="w-4 h-4 text-terminal-accent/50" />
          </div>
        </div>
      </div>

      <!-- Footer / Tags -->
      <div class="p-3 bg-terminal-black/30 flex flex-wrap gap-2">
        <template v-for="(val, key) in trade">
          <template v-if="Array.isArray(val) && !isImageColumn(key)">
             <span v-for="tag in val" :key="tag" class="px-2 py-0.5 bg-terminal-accent/10 border border-terminal-accent/20 text-terminal-accent/70 text-[10px] rounded uppercase">
               {{ tag }}
             </span>
          </template>
        </template>
        <div v-if="trade.Notes" class="w-full mt-2 text-[10px] text-terminal-text/50 italic line-clamp-2">
           "{{ trade.Notes }}"
        </div>
      </div>
    </div>

    <div v-if="trades.length === 0" class="col-span-full py-20 text-center text-terminal-text/20 uppercase tracking-widest font-bold border border-dashed border-terminal-gray rounded">
      Gallery Empty // No Records Found
    </div>
  </div>
</template>

<script lang="ts">
const isImageColumn = (header: string) => /picture|image|img/i.test(header)
</script>
