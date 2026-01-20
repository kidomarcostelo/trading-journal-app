<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'

interface Props {
  title: string
  initialExpanded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialExpanded: true
})

const isExpanded = ref(props.initialExpanded)
</script>

<template>
  <div class="border border-terminal-gray rounded-lg overflow-hidden bg-terminal-dark/30">
    <!-- Header -->
    <button 
      @click="isExpanded = !isExpanded"
      class="w-full flex items-center justify-between p-3 bg-terminal-dark hover:bg-terminal-gray/50 transition-colors group"
    >
      <div class="flex items-center gap-2">
        <component 
          :is="isExpanded ? ChevronDown : ChevronRight" 
          class="w-4 h-4 text-terminal-text group-hover:text-terminal-highlight"
        />
        <span class="text-sm font-semibold text-terminal-highlight tracking-wide uppercase">{{ title }}</span>
      </div>
      <slot name="header-right" />
    </button>

    <!-- Content -->
    <div v-if="isExpanded" class="p-4 bg-terminal-black/20 border-t border-terminal-gray">
      <slot />
    </div>
  </div>
</template>
