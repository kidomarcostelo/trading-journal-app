<template>
  <div class="h-full flex flex-col bg-slate-900 border-r border-slate-800 w-64 overflow-y-auto">
    <div class="p-4 border-b border-slate-800">
      <h2 class="text-sm font-semibold text-slate-400 uppercase tracking-wider">Pairs</h2>
    </div>
    <ul class="flex-1 p-2 space-y-1">
      <li 
        v-for="pair in pairs" 
        :key="pair"
        @click="$emit('select', pair)"
        class="px-3 py-2 rounded-md cursor-pointer transition-colors text-sm"
        :class="[
          selectedPair === pair 
            ? 'bg-slate-800 text-white font-medium' 
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
        ]"
      >
        {{ pair }}
      </li>
      <li v-if="pairs.length === 0" class="px-3 py-4 text-center text-slate-500 text-sm">
        No pairs found.
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  pairs: string[]
  selectedPair?: string
}>()

defineEmits<{
  (e: 'select', pair: string): void
}>()
</script>