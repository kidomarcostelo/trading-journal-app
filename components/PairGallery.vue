<template>
  <div class="p-6">
    <div v-if="trades.length === 0" class="flex flex-col items-center justify-center py-24 text-terminal-text/40 border border-dashed border-terminal-gray/50 rounded-xl">
      <p class="text-sm">No trades found for this pair.</p>
    </div>

    <div v-else class="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
      <div 
        v-for="(trade, index) in trades" 
        :key="trade.id || trade.ID" 
        @click="openModal(index)"
        class="trade-card bg-terminal-dark border border-terminal-gray/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-terminal-accent/50 transition-all flex flex-col group cursor-pointer"
      >
        <!-- Header -->
        <div class="p-4 flex items-center justify-between border-b border-terminal-gray/30 bg-terminal-black/20">
          <div>
            <h3 class="font-bold text-terminal-highlight text-sm">{{ trade.pair || trade.Pair || 'Unknown' }}</h3>
            <p class="text-[10px] text-terminal-text/50 font-mono mt-1">{{ trade.date || trade.Date || trade['Created At'] || trade.createdAt || 'No Date' }}</p>
          </div>
          <div :class="['px-2.5 py-1 rounded-md border text-xs font-bold font-mono', getPnLClass(trade)]">
            {{ formatPnL(trade) }}
          </div>
        </div>

        <!-- Images -->
        <div class="flex-1 flex bg-terminal-black/50 relative aspect-video">
          <!-- Before Image -->
          <div class="flex-1 relative border-r border-terminal-gray/30 group/before">
            <img 
              v-if="getBeforeImages(trade).length > 0"
              :src="getBeforeImages(trade)[0]" 
              class="w-full h-full object-cover opacity-90 group-hover/before:opacity-100 transition-opacity"
              alt="Before"
            />
            <div v-else class="w-full h-full flex flex-col items-center justify-center text-terminal-text/20">
              <span class="text-[10px] uppercase font-medium">Before</span>
            </div>
            <div class="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur text-[9px] text-white rounded border border-white/10 font-medium">Plan</div>
          </div>

          <!-- After Image -->
          <div class="flex-1 relative group/after">
            <img 
              v-if="getAfterImages(trade).length > 0"
              :src="getAfterImages(trade)[0]" 
              class="w-full h-full object-cover opacity-90 group-hover/after:opacity-100 transition-opacity"
              alt="After"
            />
            <div v-else class="w-full h-full flex flex-col items-center justify-center text-terminal-text/20">
              <span class="text-[10px] uppercase font-medium">After</span>
            </div>
            <div class="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur text-[9px] text-white rounded border border-white/10 font-medium">Result</div>
          </div>
        </div>

        <!-- Tags -->
        <div class="p-3 bg-terminal-dark flex flex-wrap gap-1.5 border-t border-terminal-gray/20">
          <template v-for="(val, key) in trade">
            <template v-if="Array.isArray(val) && !isImageColumn(String(key))">
               <span v-for="tag in val" :key="tag" class="px-1.5 py-0.5 bg-terminal-accent/10 text-terminal-accent text-[9px] rounded border border-terminal-accent/20 font-medium whitespace-nowrap">
                 {{ tag }}
               </span>
            </template>
          </template>
        </div>
      </div>
    </div>

    <!-- Carousel Modal Overlay -->
    <TradeCarouselModal
      :is-open="isModalOpen"
      :trades="trades"
      :initial-index="selectedTradeIndex"
      @close="isModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TradeCarouselModal from './TradeCarouselModal.vue'

const props = defineProps<{
  trades: any[]
}>()

const isModalOpen = ref(false)
const selectedTradeIndex = ref(0)

const openModal = (index: number) => {
  selectedTradeIndex.value = index
  isModalOpen.value = true
}

const getPnLClass = (trade: any) => {
  const pnlKey = Object.keys(trade).find(k => k.toLowerCase().includes('pnl') || k.includes('%'))
  if (!pnlKey) return 'text-terminal-text bg-terminal-gray/20 border-terminal-gray/50'
  const val = parseFloat(trade[pnlKey])
  if (val > 0) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
  if (val < 0) return 'text-rose-500 bg-rose-500/10 border-rose-500/20'
  return 'text-terminal-text bg-terminal-gray/20 border-terminal-gray/50'
}

const formatPnL = (trade: any) => {
  const pnlKey = Object.keys(trade).find(k => k.toLowerCase().includes('pnl') || k.includes('%'))
  return pnlKey ? trade[pnlKey] : '0'
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

const isImageColumn = (header: string) => /picture|image|img/i.test(header)
</script>