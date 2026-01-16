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
const inputRef = ref<HTMLInputElement | null>(null)

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
  if (isOpen.value) inputRef.value?.focus()
}

const selectOption = (option: string) => {
  if (props.multiple) {
    const newValue = [...selectedValues.value, option]
    emit('update:modelValue', newValue)
    query.value = '' // Reset search
    inputRef.value?.focus()
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
    emit('update:modelValue', val)
  }
}

const onEnter = () => {
  if (query.value.trim()) {
    const match = filteredOptions.value.find(o => o.toLowerCase() === query.value.toLowerCase())
    if (match) {
      selectOption(match)
    } else {
      selectOption(query.value.trim())
    }
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

if (!props.multiple && typeof props.modelValue === 'string') {
  query.value = props.modelValue
}
</script>

<template>
  <div ref="containerRef" class="space-y-1.5">
    <label class="block text-xs font-medium text-terminal-text/70 ml-1">
      {{ label }}
    </label>

    <!-- Combined Input Container -->
    <div 
      class="relative w-full bg-terminal-black/50 border border-terminal-gray rounded-lg focus-within:border-terminal-accent focus-within:ring-1 focus-within:ring-terminal-accent/20 transition-all flex flex-wrap items-center p-1.5 gap-1.5"
    >
      <!-- Selected Chips -->
      <span
        v-if="multiple"
        v-for="val in selectedValues"
        :key="val"
        class="bg-terminal-dark border border-terminal-gray text-terminal-highlight px-2 py-0.5 rounded-md text-xs flex items-center gap-1 font-medium shadow-sm"
      >
        {{ val }}
        <button @click="removeOption(val)" type="button" class="hover:text-terminal-accent transition-colors">
          <X class="w-3 h-3" />
        </button>
      </span>

      <!-- Input -->
      <div class="flex-1 min-w-[100px] relative">
         <input
          ref="inputRef"
          type="text"
          :value="query"
          @input="onInput"
          @keydown.enter.prevent="onEnter"
          @focus="isOpen = true"
          class="w-full bg-transparent border-none outline-none text-terminal-highlight text-sm placeholder-terminal-text/30 px-1"
          :placeholder="multiple && selectedValues.length === 0 ? 'Search...' : (multiple ? '' : 'Select...')"
        />
      </div>

      <!-- Toggle Button -->
      <button 
        type="button"
        @click="toggleOpen"
        class="absolute right-2 top-1/2 -translate-y-1/2 text-terminal-text/40 hover:text-terminal-highlight transition-colors"
      >
        <ChevronsUpDown class="w-4 h-4" />
      </button>
    </div>

    <!-- Dropdown -->
    <div
      v-if="isOpen && (filteredOptions.length > 0 || query.trim())"
      class="absolute z-50 w-full max-w-[calc(100%-3rem)] md:max-w-md mt-1 bg-terminal-dark border border-terminal-gray rounded-lg shadow-xl ring-1 ring-black/5 max-h-60 overflow-auto py-1"
      :style="{ width: containerRef ? `${containerRef.offsetWidth}px` : '100%' }"
    >
      <button
        v-for="option in filteredOptions"
        :key="option"
        type="button"
        @click="selectOption(option)"
        class="w-full text-left px-3 py-2 text-sm text-terminal-text hover:bg-terminal-gray/50 hover:text-terminal-highlight flex items-center justify-between group transition-colors"
      >
        <span>{{ option }}</span>
        <Check v-if="selectedValues.includes(option)" class="w-3 h-3 text-terminal-accent" />
      </button>

      <!-- Create Option -->
      <button
        v-if="query.trim() && !filteredOptions.some(o => o.toLowerCase() === query.trim().toLowerCase())"
        type="button"
        @click="selectOption(query.trim())"
        class="w-full text-left px-3 py-2 text-sm text-terminal-accent hover:bg-terminal-accent/10 flex items-center gap-2 border-t border-terminal-gray/30"
      >
        <span>Create "{{ query }}"</span>
        <span class="text-[10px] bg-terminal-accent/20 px-1.5 py-0.5 rounded ml-auto">Enter</span>
      </button>
    </div>
  </div>
</template>