<template>
  <div class="h-full flex flex-col bg-slate-900 border-r border-slate-800 w-64 overflow-y-auto">
    <div class="p-4 border-b border-slate-800 space-y-4">
      <h2 class="text-sm font-semibold text-slate-400 uppercase tracking-wider">Pairs</h2>
      <div class="relative">
        <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="Search pairs..."
          class="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
        />
      </div>
    </div>
    <ul class="flex-1 p-2 space-y-1">
      <li 
        v-for="pair in filteredPairs" 
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
      <li v-if="filteredPairs.length === 0" class="px-3 py-4 text-center text-slate-500 text-sm">
        No pairs found.
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from 'lucide-vue-next'

const props = defineProps<{
  pairs: string[]
  selectedPair?: string
}>()

defineEmits<{
  (e: 'select', pair: string): void
}>()

const searchQuery = ref('')

const filteredPairs = computed(() => {
  if (!searchQuery.value) return props.pairs
  const lowerQuery = searchQuery.value.toLowerCase()
  return props.pairs.filter(p => p.toLowerCase().includes(lowerQuery))
})
</script>