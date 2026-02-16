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

// Helpers to detect key names in the incoming data
const findKey = (obj: any, candidates: string[]) => {
  return candidates.find(k => Object.prototype.hasOwnProperty.call(obj, k)) || candidates[0]
}

const actionKey = computed(() => findKey(form.value, ['Action', 'Direction', 'Type']));
const marketKey = computed(() => findKey(form.value, ['Market', 'market']));
const statusKey = computed(() => findKey(form.value, ['Status', 'status']));
const riskKey = computed(() => findKey(form.value, ['Risk', 'risk']));
const pnlKey = computed(() => findKey(form.value, ['PNL', 'PnL', 'Net PnL', 'pnl']));
const rrKey = computed(() => findKey(form.value, ['RR', 'rr', 'R/R', 'Risk Reward']));

// Watch for prop changes to reset form (e.g. switching trades)
watch(() => props.trade, (newTrade) => {
  form.value = { ...newTrade };
}, { deep: true });

const updateField = (fieldKey: string, value: any) => {
  form.value[fieldKey] = value;
  emit('update', { ...form.value });
};
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
    <!-- Action (Direction) -->
    <div class="flex flex-col gap-1">
      <label class="text-[10px] uppercase font-bold text-terminal-text/90 tracking-wider">Action</label>
      <div class="flex bg-terminal-black border border-terminal-gray/30 rounded p-0.5 h-[34px]">
        <button 
          @click="updateField(actionKey, 'Long')"
          class="flex-1 px-2 py-1 text-[10px] font-bold uppercase rounded transition-colors"
          :class="['long', 'buy'].includes(String(form[actionKey]).toLowerCase()) ? 'bg-emerald-500/20 text-emerald-400' : 'text-terminal-text/40 hover:text-terminal-text'"
        >
          Long
        </button>
        <button 
          @click="updateField(actionKey, 'Short')"
          class="flex-1 px-2 py-1 text-[10px] font-bold uppercase rounded transition-colors"
          :class="['short', 'sell'].includes(String(form[actionKey]).toLowerCase()) ? 'bg-rose-500/20 text-rose-400' : 'text-terminal-text/40 hover:text-terminal-text'"
        >
          Short
        </button>
      </div>
    </div>

    <!-- Market -->
    <div class="flex flex-col gap-1">
      <label class="text-[10px] uppercase font-bold text-terminal-text/90 tracking-wider">Market</label>
      <select 
        :value="form[marketKey]"
        @change="updateField(marketKey, ($event.target as HTMLSelectElement).value)"
        class="w-full appearance-none bg-terminal-black border border-terminal-gray/30 rounded px-2 py-1.5 text-xs text-terminal-text hover:border-terminal-gray/50 focus:border-terminal-accent focus:outline-none transition-colors cursor-pointer"
      >
        <option value="" disabled>Select Market</option>
        <option value="Crypto">Crypto</option>
        <option value="Forex">Forex</option>
        <option value="Indices">Indices</option>
        <option value="Stocks">Stocks</option>
        <option value="Commodities">Commodities</option>
      </select>
    </div>

    <!-- Status -->
    <div class="flex flex-col gap-1">
      <label class="text-[10px] uppercase font-bold text-terminal-text/90 tracking-wider">Status</label>
      <select 
        :value="form[statusKey]"
        @change="updateField(statusKey, ($event.target as HTMLSelectElement).value)"
        class="w-full appearance-none bg-terminal-black border border-terminal-gray/30 rounded px-2 py-1.5 text-xs text-terminal-text hover:border-terminal-gray/50 focus:border-terminal-accent focus:outline-none transition-colors cursor-pointer"
      >
        <option value="" disabled>Select Status</option>
        <option value="Open">Open</option>
        <option value="Closed">Closed</option>
        <option value="Cancelled">Cancelled</option>
        <option value="Missed">Missed</option>
      </select>
    </div>

    <!-- Risk -->
    <div class="flex flex-col gap-1">
      <label class="text-[10px] uppercase font-bold text-terminal-text/90 tracking-wider">Risk</label>
      <input 
        type="number" 
        step="any"
        :value="form[riskKey]"
        @input="updateField(riskKey, ($event.target as HTMLInputElement).value)"
        class="bg-terminal-black border border-terminal-gray/30 rounded px-2 py-1.5 text-sm text-terminal-highlight focus:border-terminal-accent focus:outline-none transition-colors"
        placeholder="0.00"
      />
    </div>

    <!-- PNL -->
    <div class="flex flex-col gap-1">
      <label class="text-[10px] uppercase font-bold text-terminal-text/90 tracking-wider">PNL</label>
      <input 
        type="number" 
        step="any"
        :value="form[pnlKey]"
        @input="updateField(pnlKey, ($event.target as HTMLInputElement).value)"
        class="bg-terminal-black border border-terminal-gray/30 rounded px-2 py-1.5 text-sm font-mono focus:border-terminal-accent focus:outline-none transition-colors"
        :class="Number(form[pnlKey]) > 0 ? 'text-emerald-400' : Number(form[pnlKey]) < 0 ? 'text-rose-400' : 'text-terminal-text'"
        placeholder="0.00"
      />
    </div>

    <!-- RR -->
    <div class="flex flex-col gap-1">
      <label class="text-[10px] uppercase font-bold text-terminal-text/90 tracking-wider">RR</label>
      <input 
        type="number" 
        step="any"
        :value="form[rrKey]"
        @input="updateField(rrKey, ($event.target as HTMLInputElement).value)"
        class="bg-terminal-black border border-terminal-gray/30 rounded px-2 py-1.5 text-sm text-terminal-highlight focus:border-terminal-accent focus:outline-none transition-colors font-mono"
        placeholder="0.00"
      />
    </div>
  </div>
</template>