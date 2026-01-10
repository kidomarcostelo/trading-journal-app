<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Check, ChevronsUpDown, X } from 'lucide-vue-next'

interface Props {
  label: string
  options: string[]
  modelValue: string | string[]
  multiple?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const query = ref('')
const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

// Normalize modelValue to array for consistent handling internally
const selectedValues = computed(() => {
  if (Array.isArray(props.modelValue)) return props.modelValue
  return props.modelValue ? [props.modelValue] : []
})

const filteredOptions = computed(() => {
  const q = query.value.toLowerCase()
  return props.options.filter(opt => 
    opt.toLowerCase().includes(q) && 
    (props.multiple ? !selectedValues.value.includes(opt) : true)
  )
})

const toggleOpen = () => {
  isOpen.value = !isOpen.value
}

const selectOption = (option: string) => {
  if (props.multiple) {
    const newValue = [...selectedValues.value, option]
    emit('update:modelValue', newValue)
    query.value = '' // Reset search
  } else {
    emit('update:modelValue', option)
    query.value = option // Set input to selected value
    isOpen.value = false
  }
}

const removeOption = (option: string) => {
  if (props.multiple) {
    const newValue = selectedValues.value.filter(v => v !== option)
    emit('update:modelValue', newValue)
  } else {
    emit('update:modelValue', '')
    query.value = ''
  }
}

const onInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  query.value = val
  isOpen.value = true
  
  if (!props.multiple) {
    // In single mode, input update also clears selection if it doesn't match?
    // Or allows custom value?
    // For now, let's treat input as just a filter. 
    // If the user wants to set a custom value, they type it.
    // If we want to support custom values, we emit the query.
    emit('update:modelValue', val)
  }
}

// Close on click outside
const handleClickOutside = (e: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

// Initialize query for single mode
if (!props.multiple && typeof props.modelValue === 'string') {
  query.value = props.modelValue
}
</script>

<template>
  <div ref="containerRef" class="relative space-y-2">
    <label class="block text-xs uppercase tracking-widest text-terminal-text/60 font-semibold">
      {{ label }}
    </label>

    <!-- Selected Chips (Multiple Mode) -->
    <div v-if="multiple && selectedValues.length > 0" class="flex flex-wrap gap-2 mb-2">
      <span
        v-for="val in selectedValues"
        :key="val"
        class="bg-terminal-accent/20 border border-terminal-accent text-terminal-accent px-2 py-0.5 rounded-full text-xs flex items-center gap-1"
      >
        {{ val }}
        <button @click="removeOption(val)" type="button" class="hover:text-terminal-text">
          <X class="w-3 h-3" />
        </button>
      </span>
    </div>

    <!-- Input Group -->
    <div class="relative">
      <input
        type="text"
        :value="query"
        @input="onInput"
        @focus="isOpen = true"
        class="w-full bg-terminal-black border border-terminal-gray focus:border-terminal-accent text-terminal-text px-3 py-2 outline-none font-mono text-sm pr-8"
        :placeholder="multiple ? 'Search...' : 'Select or type...'"
      />
      <button 
        type="button"
        @click="toggleOpen"
        class="absolute right-2 top-1/2 -translate-y-1/2 text-terminal-text/50 hover:text-terminal-accent"
      >
        <ChevronsUpDown class="w-4 h-4" />
      </button>
    </div>

    <!-- Dropdown -->
    <div
      v-if="isOpen && filteredOptions.length > 0"
      class="absolute z-50 w-full mt-1 bg-terminal-dark border border-terminal-gray shadow-xl max-h-60 overflow-auto py-1"
    >
      <button
        v-for="option in filteredOptions"
        :key="option"
        type="button"
        @click="selectOption(option)"
        class="w-full text-left px-3 py-2 text-sm text-terminal-text hover:bg-terminal-accent/10 hover:text-terminal-accent flex items-center justify-between group"
      >
        <span>{{ option }}</span>
        <Check v-if="selectedValues.includes(option)" class="w-3 h-3 text-terminal-accent" />
      </button>
    </div>
  </div>
</template>
