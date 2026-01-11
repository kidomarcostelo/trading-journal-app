<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  trade: any
}>()

const emit = defineEmits<{
  (e: 'update', data: any): void
}>()

// Local state for editing
const form = ref({ ...props.trade })

// Watch for prop changes to reset form (e.g. switching trades)
watch(() => props.trade, (newTrade) => {
  form.value = { ...newTrade }
}, { deep: true })

const updateField = (field: string, value: any) => {
  const numValue = parseFloat(value)
  form.value[field] = isNaN(numValue) ? value : numValue
  
  // Auto-calculate PnL
  if (['EntryPrice', 'ExitPrice', 'Size'].includes(field)) {
    calculatePnL()
  }
  
  emit('update', { ...form.value })
}

const calculatePnL = () => {
  const entry = parseFloat(form.value.EntryPrice) || 0
  const exit = parseFloat(form.value.ExitPrice) || 0
  const size = parseFloat(form.value.Size) || 0
  const dir = String(form.value.Direction || '').toLowerCase()
  
  if (entry && exit && size) {
    let pnl = 0
    if (dir === 'long' || dir === 'buy') {
      pnl = (exit - entry) * size
    } else if (dir === 'short' || dir === 'sell') {
      pnl = (entry - exit) * size
    }
    form.value.PnL = Number(pnl.toFixed(2))
  }
}
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
    <!-- Entry Price -->
    <div class="flex flex-col gap-1">
      <label class="text-[10px] uppercase font-bold text-terminal-text/60 tracking-wider">Entry Price</label>
      <input 
        type="number" 
        :value="form.EntryPrice"
        @input="updateField('EntryPrice', ($event.target as HTMLInputElement).value)"
        class="bg-terminal-black border border-terminal-gray/30 rounded px-2 py-1.5 text-sm text-terminal-highlight focus:border-terminal-accent focus:outline-none transition-colors"
        placeholder="0.00"
      />
    </div>

    <!-- Exit Price -->
    <div class="flex flex-col gap-1">
      <label class="text-[10px] uppercase font-bold text-terminal-text/60 tracking-wider">Exit Price</label>
      <input 
        type="number" 
        :value="form.ExitPrice"
        @input="updateField('ExitPrice', ($event.target as HTMLInputElement).value)"
        class="bg-terminal-black border border-terminal-gray/30 rounded px-2 py-1.5 text-sm text-terminal-highlight focus:border-terminal-accent focus:outline-none transition-colors"
        placeholder="0.00"
      />
    </div>

    <!-- Size -->
    <div class="flex flex-col gap-1">
      <label class="text-[10px] uppercase font-bold text-terminal-text/60 tracking-wider">Size</label>
      <input 
        type="number" 
        :value="form.Size"
        @input="updateField('Size', ($event.target as HTMLInputElement).value)"
        class="bg-terminal-black border border-terminal-gray/30 rounded px-2 py-1.5 text-sm text-terminal-highlight focus:border-terminal-accent focus:outline-none transition-colors"
        placeholder="1.0"
      />
    </div>

    <!-- PnL -->
    <div class="flex flex-col gap-1">
      <label class="text-[10px] uppercase font-bold text-terminal-text/60 tracking-wider">PnL</label>
      <input 
        type="number" 
        :value="form.PnL"
        @input="updateField('PnL', ($event.target as HTMLInputElement).value)"
        class="bg-terminal-black border border-terminal-gray/30 rounded px-2 py-1.5 text-sm font-mono focus:border-terminal-accent focus:outline-none transition-colors"
        :class="Number(form.PnL) > 0 ? 'text-emerald-400' : Number(form.PnL) < 0 ? 'text-rose-400' : 'text-terminal-text'"
        placeholder="0.00"
      />
    </div>

    <!-- MAE -->
    <div class="flex flex-col gap-1">
      <label class="text-[10px] uppercase font-bold text-terminal-text/60 tracking-wider">MAE</label>
      <input 
        type="number" 
        :value="form.MAE"
        @input="updateField('MAE', ($event.target as HTMLInputElement).value)"
        class="bg-terminal-black border border-terminal-gray/30 rounded px-2 py-1.5 text-sm text-rose-400/80 focus:border-terminal-accent focus:outline-none transition-colors"
        placeholder="0.00"
      />
    </div>
  </div>
</template>