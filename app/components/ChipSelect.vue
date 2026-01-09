<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="option in options"
      :key="option"
      type="button"
      @click="toggle(option)"
      :class="[
        'px-3 py-1 rounded-full text-sm font-medium transition-colors border',
        isSelected(option)
          ? getSelectedClass(option)
          : 'bg-transparent border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300'
      ]"
    >
      {{ option }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const { getOptions } = useChips()

const props = defineProps<{
  category: string
  modelValue: string | string[]
  multiple?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | string[]): void
}>()

const options = computed(() => getOptions(props.category))

const isSelected = (option: string) => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.modelValue.includes(option)
  }
  return props.modelValue === option
}

const toggle = (option: string) => {
  if (props.multiple) {
    const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const index = current.indexOf(option)
    if (index === -1) {
      current.push(option)
    } else {
      current.splice(index, 1)
    }
    emit('update:modelValue', current)
  } else {
    emit('update:modelValue', option === props.modelValue ? '' : option)
  }
}

const getSelectedClass = (option: string) => {
  const lower = option.toLowerCase()
  if (lower === 'win') return 'bg-green-600 border-green-600 text-white'
  if (lower === 'loss') return 'bg-red-600 border-red-600 text-white'
  return 'bg-blue-600 border-blue-600 text-white'
}
</script>
