<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = defineProps<{
  symbol: string
  market?: string
}>()

const containerId = ref(`tv-widget-${Math.random().toString(36).substr(2, 9)}`)

const normalizedSymbol = computed(() => {
  if (!props.symbol) return 'BTCUSDT'
  // Remove slashes, spaces, and any existing colons (like FX:)
  let clean = props.symbol.replace(/[\/\s:]/g, '')
  
  // If it starts with FX, remove it
  if (clean.toUpperCase().startsWith('FX')) {
    clean = clean.substring(2)
  }
  
  // Prefer Tickmill
  return `TICKMILL:${clean.toUpperCase()}`
})

const loadWidget = () => {
  if (typeof window === 'undefined' || !window.TradingView) return

  new window.TradingView.widget({
    "autosize": true,
    "symbol": normalizedSymbol.value,
    "interval": "D",
    "timezone": "Etc/UTC",
    "theme": "dark",
    "style": "1",
    "locale": "en",
    "toolbar_bg": "#f1f3f6",
    "enable_publishing": false,
    "hide_top_toolbar": false,
    "allow_symbol_change": true,
    "container_id": containerId.value,
  })
}

onMounted(() => {
  // Add TradingView Script if not present
  if (!document.getElementById('tradingview-widget-script')) {
    const script = document.createElement('script')
    script.id = 'tradingview-widget-script'
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = loadWidget
    document.head.appendChild(script)
  } else {
    loadWidget()
  }
})

watch(() => normalizedSymbol.value, () => {
  loadWidget()
})
</script>

<template>
  <div class="w-full aspect-video border border-terminal-gray rounded-lg overflow-hidden bg-terminal-black">
    <div :id="containerId" class="w-full h-full"></div>
  </div>
</template>

<script lang="ts">
declare global {
  interface Window {
    TradingView: any
  }
}
</script>
