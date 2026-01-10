<script setup lang="ts">
interface Props {
  label: string
  options: string[]
  modelValue: string[]
  category?: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const toggleOption = (option: string) => {
  const newValue = [...props.modelValue]
  const index = newValue.indexOf(option)
  if (index === -1) {
    newValue.push(option)
  } else {
    newValue.splice(index, 1)
  }
  emit('update:modelValue', newValue)
}

const isSelected = (option: string) => props.modelValue.includes(option)

// Category-based colors
const getChipClass = (option: string) => {
  const selected = isSelected(option)
  const cat = props.category?.toLowerCase() || ''
  
  const base = "px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200"
  
  if (!selected) {
    return `${base} bg-terminal-dark border-terminal-gray text-terminal-text hover:border-terminal-accent/50`
  }

  // Handle Win/Loss specifically
  if (option.toLowerCase() === 'win' || option.toLowerCase() === 'profit') {
    return `${base} bg-emerald-900/40 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]`
  }
  if (option.toLowerCase() === 'loss' || option.toLowerCase() === 'mistake') {
    return `${base} bg-rose-900/40 border-rose-500 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)]`
  }

  // Default selected style (using terminal accent)
  return `${base} bg-terminal-accent/20 border-terminal-accent text-terminal-accent shadow-[0_0_10px_rgba(var(--color-terminal-accent),0.2)]`
}
</script>

<template>
  <div class="space-y-2">
    <label class="text-xs uppercase tracking-widest text-terminal-text/60 font-semibold">
      {{ label }}
    </label>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="option in options"
        :key="option"
        type="button"
        @click="toggleOption(option)"
        :class="getChipClass(option)"
      >
        {{ option }}
      </button>
    </div>
  </div>
</template>
