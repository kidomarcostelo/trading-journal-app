<script setup lang="ts">
import { ref } from 'vue'
import { Save, Settings, Loader2, Circle, CheckCircle2 } from 'lucide-vue-next'

type SaveMode = 'auto' | 'manual' | 'navigation'

interface Props {
  modelValue: SaveMode
  isDirty?: boolean
  isLoading?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: SaveMode): void
  (e: 'save'): void
}>()

const showSettings = ref(false)

const modes: { value: SaveMode; label: string; description: string }[] = [
  { value: 'auto', label: 'Always Autosave', description: 'Saves automatically as you type' },
  { value: 'manual', label: 'Manual Only', description: 'Only saves when you click the button' },
  { value: 'navigation', label: 'Save on Navigation', description: 'Saves when switching trades' }
]

const toggleSettings = () => {
  showSettings.value = !showSettings.value
}

const setMode = (mode: SaveMode) => {
  emit('update:modelValue', mode)
  showSettings.value = false
}
</script>

<template>
  <div class="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
    <!-- Settings Menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div v-if="showSettings" class="bg-terminal-black border border-terminal-gray rounded-lg shadow-xl p-2 mb-2 w-64">
        <div class="text-xs font-bold text-terminal-text/50 uppercase tracking-wider mb-2 px-2">Save Mode</div>
        <button
          v-for="mode in modes"
          :key="mode.value"
          @click="setMode(mode.value)"
          class="w-full text-left px-3 py-2 rounded text-sm hover:bg-terminal-highlight/10 transition-colors flex flex-col gap-0.5"
          :class="modelValue === mode.value ? 'text-terminal-accent' : 'text-terminal-text'"
        >
          <div class="flex items-center gap-2 font-medium">
             <div class="w-2 h-2 rounded-full" :class="modelValue === mode.value ? 'bg-terminal-accent' : 'bg-transparent border border-terminal-text/30'"></div>
             {{ mode.label }}
          </div>
          <div class="text-[10px] text-terminal-text/50 pl-4">{{ mode.description }}</div>
        </button>
      </div>
    </Transition>

    <div class="flex items-center gap-2">
      <!-- Settings Trigger -->
      <button
        type="button"
        aria-label="Save Settings"
        @click="toggleSettings"
        class="bg-terminal-black border border-terminal-gray text-terminal-text/70 hover:text-terminal-text hover:border-terminal-text/50 rounded-full p-2 shadow-lg transition-all"
        :class="{ 'bg-terminal-highlight/20 border-terminal-highlight/50 text-terminal-highlight': showSettings }"
      >
        <Settings class="w-5 h-5" />
      </button>

      <!-- Main FAB -->
      <button
        type="button"
        aria-label="Save"
        @click="emit('save')"
        class="group relative flex items-center justify-center bg-terminal-accent text-terminal-black rounded-full p-4 shadow-lg shadow-terminal-accent/20 hover:shadow-terminal-accent/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isLoading || (!isDirty && modelValue === 'manual')"
      >
        <!-- Loading State -->
        <Loader2 v-if="isLoading" class="w-6 h-6 animate-spin" />
        
        <!-- Save Icon -->
        <Save v-else class="w-6 h-6" />

        <!-- Dirty Indicator (Manual Mode Only) -->
        <span 
            v-if="modelValue === 'manual' && isDirty && !isLoading" 
            class="absolute top-0 right-0 -mt-1 -mr-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-terminal-black animate-pulse"
        ></span>
      </button>
    </div>
  </div>
</template>
