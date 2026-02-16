<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-vue-next'

const props = defineProps<{
  startDate: string
  endDate: string
  autoOpen?: boolean
  inline?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:startDate', val: string): void
  (e: 'update:endDate', val: string): void
  (e: 'close'): void
}>()

const showPicker = ref(props.autoOpen || false)
const container = ref<HTMLElement | null>(null)

// Calendar state
const viewDate = ref(new Date())
const month = computed(() => viewDate.value.getMonth())
const year = computed(() => viewDate.value.getFullYear())

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const daysInMonth = computed(() => {
  return new Date(year.value, month.value + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
  return new Date(year.value, month.value, 1).getDay()
})

const prevMonthDays = computed(() => {
  const prevMonthLastDay = new Date(year.value, month.value, 0).getDate()
  const days = []
  for (let i = firstDayOfMonth.value - 1; i >= 0; i--) {
    days.push({ day: prevMonthLastDay - i, month: month.value - 1, year: year.value, current: false })
  }
  return days
})

const currentMonthDays = computed(() => {
  const days = []
  for (let i = 1; i <= daysInMonth.value; i++) {
    days.push({ day: i, month: month.value, year: year.value, current: true })
  }
  return days
})

const nextMonthDays = computed(() => {
  const totalSlots = 42 // 6 weeks
  const remainingSlots = totalSlots - prevMonthDays.value.length - currentMonthDays.value.length
  const days = []
  for (let i = 1; i <= remainingSlots; i++) {
    days.push({ day: i, month: month.value + 1, year: year.value, current: false })
  }
  return days
})

const allDays = computed(() => [...prevMonthDays.value, ...currentMonthDays.value, ...nextMonthDays.value])

const formatDate = (date: { day: number, month: number, year: number }) => {
  const d = new Date(date.year, date.month, date.day)
  return d.toISOString().split('T')[0]
}

const isSelected = (date: { day: number, month: number, year: number }) => {
  const formatted = formatDate(date)
  return formatted === props.startDate || formatted === props.endDate
}

const isInRange = (date: { day: number, month: number, year: number }) => {
  if (!props.startDate || !props.endDate) return false
  const formatted = formatDate(date)
  return formatted > props.startDate && formatted < props.endDate
}

const selectDate = (date: { day: number, month: number, year: number }) => {
  const formatted = formatDate(date)
  
  if (!props.startDate || (props.startDate && props.endDate)) {
    emit('update:startDate', formatted)
    emit('update:endDate', '')
  } else {
    if (formatted < props.startDate) {
      emit('update:endDate', props.startDate)
      emit('update:startDate', formatted)
    } else {
      emit('update:endDate', formatted)
    }
  }
}

const changeMonth = (delta: number) => {
  viewDate.value = new Date(year.value, month.value + delta, 1)
}

const handleClickOutside = (e: MouseEvent) => {
  if (container.value && !container.value.contains(e.target as Node)) {
    showPicker.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

const displayRange = computed(() => {
  if (!props.startDate) return 'Select Date Range'
  if (!props.endDate) return `${props.startDate} - ...`
  return `${props.startDate} to ${props.endDate}`
})
</script>

<template>
  <div :class="inline ? 'w-full' : 'relative w-full'" ref="container">
    <button 
      v-if="!inline"
      type="button"
      @click="showPicker = !showPicker"
      class="w-full flex items-center justify-between bg-terminal-black border border-terminal-gray/30 rounded px-2 py-1 text-[10px] text-terminal-text hover:border-terminal-accent/50 transition-all outline-none"
    >
      <span class="truncate">{{ displayRange }}</span>
      <CalendarIcon class="w-3 h-3 text-terminal-text/40 ml-2" />
    </button>

    <div 
      v-if="inline || showPicker"
      :class="[
        'bg-terminal-black border border-terminal-gray rounded-lg p-4 animate-in fade-in zoom-in duration-200',
        inline ? 'w-full' : 'absolute top-full left-0 mt-1 z-50 shadow-2xl w-[280px]'
      ]"
    >
      <!-- Calendar Header -->
      <div class="flex items-center justify-between mb-4">
        <button @click="changeMonth(-1)" class="p-1 hover:bg-terminal-gray/20 rounded-md transition-colors text-terminal-text/60">
          <ChevronLeft class="w-4 h-4" />
        </button>
        <span class="text-xs font-bold uppercase tracking-widest text-terminal-highlight">
          {{ monthNames[month] }} {{ year }}
        </span>
        <button @click="changeMonth(1)" class="p-1 hover:bg-terminal-gray/20 rounded-md transition-colors text-terminal-text/60">
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>

      <!-- Weekdays -->
      <div class="grid grid-cols-7 mb-2">
        <div v-for="day in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']" :key="day" class="text-[8px] font-bold text-center text-terminal-text/30 uppercase">
          {{ day }}
        </div>
      </div>

      <!-- Days Grid -->
      <div class="grid grid-cols-7 gap-px bg-terminal-gray/10 rounded overflow-hidden">
        <button
          v-for="(date, i) in allDays"
          :key="i"
          @click="selectDate(date)"
          class="aspect-square flex items-center justify-center text-[10px] transition-all relative"
          :class="[
            date.current ? 'text-terminal-text' : 'text-terminal-text/20',
            isSelected(date) ? 'bg-terminal-accent text-terminal-black font-bold z-10' : 'hover:bg-terminal-accent/10',
            isInRange(date) ? 'bg-terminal-accent/10 text-terminal-accent' : ''
          ]"
        >
          {{ date.day }}
          <div v-if="isSelected(date)" class="absolute inset-0 border border-terminal-accent pointer-events-none"></div>
        </button>
      </div>

      <!-- Footer Action -->
      <div class="mt-4 flex justify-between items-center pt-3 border-t border-terminal-gray/30">
         <button @click="emit('update:startDate', ''); emit('update:endDate', '')" class="text-[9px] uppercase font-bold text-rose-400/60 hover:text-rose-400 transition-colors">Clear</button>
         <button @click="showPicker = false; emit('close')" class="px-3 py-1 bg-terminal-accent/20 hover:bg-terminal-accent/40 border border-terminal-accent/50 rounded text-[9px] font-bold uppercase text-terminal-accent transition-all">Done</button>
      </div>
    </div>
  </div>
</template>
