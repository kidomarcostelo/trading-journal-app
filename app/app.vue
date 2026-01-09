<template>
  <div class="p-4 space-y-4 bg-slate-900 text-slate-300 min-h-screen">
    <h1 class="text-2xl font-bold">Trading Journal Design System</h1>

    <div class="space-y-2">
      <h2 class="text-lg font-semibold">Chip Select (Single)</h2>
      <ChipSelect
        category="Strategy"
        :model-value="singleVal"
        @update:model-value="singleVal = $event"
      />
      <p>Selected: {{ singleVal }}</p>
    </div>

    <div class="space-y-2">
      <h2 class="text-lg font-semibold">Chip Select (Multiple)</h2>
      <ChipSelect
        category="Psychology"
        :model-value="multiVal"
        multiple
        @update:model-value="multiVal = $event"
      />
      <p>Selected: {{ multiVal }}</p>
    </div>

    <div class="space-y-2">
      <h2 class="text-lg font-semibold">Chip Select (Result)</h2>
      <ChipSelect
        category="Result"
        :model-value="resultVal"
        @update:model-value="resultVal = $event"
      />
      <p>Selected: {{ resultVal }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const singleVal = ref('')
const multiVal = ref([])
const resultVal = ref('')

// In Nuxt 4/3, composables in app/composables are auto-imported.
// We use useChips directly.

const { chips } = useChips()
chips.value = {
  Strategy: ['Breakout', 'Pullback', 'Reversal'],
  Psychology: ['FOMO', 'Patient', 'Hesitant'],
  Result: ['Win', 'Loss', 'Breakeven']
}
</script>
