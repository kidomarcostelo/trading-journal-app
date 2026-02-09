<script lang="ts">
export default {
  name: 'TradeSummaryCard'
}
</script>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { MoreVertical, Trash2 } from 'lucide-vue-next'

const props = defineProps<{
  trade: {
    ID?: string | number
    id?: string | number
    Pair?: string
    Action?: string
    Market?: string
    Status?: string
    Date?: string
    [key: string]: any
  }
  active?: boolean
  collapsed?: boolean
}>()

const emit = defineEmits(['delete'])

const showMenu = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const toggleMenu = (e: MouseEvent) => {
  e.stopPropagation()
  showMenu.value = !showMenu.value
}

const handleClickOutside = (e: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    showMenu.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

const handleDelete = (e: MouseEvent) => {
  e.stopPropagation()
  showMenu.value = false
  emit('delete', props.trade.ID || props.trade.id)
}

const actionClass = computed(() => {
  const v = String(props.trade.Action).toLowerCase()
  if (v === 'long' || v === 'buy') return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
  if (v === 'short' || v === 'sell') return 'text-rose-500 bg-rose-500/10 border-rose-500/20'
  return 'text-terminal-text bg-terminal-gray/20 border-terminal-gray/30'
})

const statusClass = computed(() => {
  const v = String(props.trade.Status).toLowerCase()
  if (v === 'open') return 'border-emerald-500/50 text-emerald-400'
  if (v === 'closed') return 'border-terminal-gray text-terminal-text/60'
  if (v === 'cancelled' || v === 'missed') return 'border-rose-500/30 text-rose-400/60'
  return 'border-terminal-gray text-terminal-text/40'
})

const displayDate = computed(() => {
  const val = props.trade.Date || props.trade['Date Created'] || props.trade['Created At'] || props.trade.date
  
  if (!val) return '--/--/----'

  // Handle Excel Serial Date (e.g. 45985)
  if (!isNaN(Number(val)) && Number(val) > 20000) {
    const date = new Date((Number(val) - 25569) * 86400 * 1000)
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(date.getUTCDate()).padStart(2, '0')
    const yyyy = date.getUTCFullYear()
    return `${mm}/${dd}/${yyyy}`
  }

  return val
})
</script>

<template>
  <div 
    class="border-b border-terminal-gray/50 transition-colors cursor-pointer group relative"
    :class="[
      active ? 'bg-terminal-gray/20 border-l-4 border-l-terminal-accent' : 'hover:bg-terminal-gray/10 border-l-4 border-l-transparent',
      'p-3'
    ]"
    :title="collapsed ? trade.Pair : ''"
  >
    <div 
      class="gap-2 items-center text-[11px]"
      :class="collapsed ? 'flex items-center justify-between gap-3' : 'grid grid-cols-[1.5fr_0.6fr_1fr_0.7fr_1.2fr_0.2fr]'"
    >
      <!-- Col 1: Pair -->
      <div 
        class="font-bold text-terminal-highlight flex items-center min-w-0"
      >
        <span class="whitespace-nowrap">{{ trade.Pair || 'Untitled' }}</span>
      </div>

      <!-- Col 2: Action -->
      <div v-if="!collapsed">
        <span :class="['px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-tighter', actionClass]">
          {{ trade.Action || '???' }}
        </span>
      </div>

      <!-- Col 3: Market -->
      <div v-if="!collapsed" class="text-terminal-text/60 truncate uppercase tracking-tight">
        {{ trade.Market || '-' }}
      </div>

      <!-- Col 4: Status -->
      <div v-if="!collapsed">
        <span :class="['px-1.5 py-0.5 rounded border text-[9px] font-medium uppercase truncate block text-center', statusClass]">
          {{ trade.Status || 'Unk' }}
        </span>
      </div>

      <!-- Col 5: Date -->
      <div v-if="!collapsed" class="text-right text-terminal-text/60 font-mono text-[10px]">
        {{ displayDate }}
      </div>

      <!-- Col 6: Menu -->
      <div class="relative flex justify-end" ref="menuRef">
        <button 
          @click="toggleMenu"
          class="p-1 hover:bg-terminal-gray/30 rounded transition-colors text-terminal-text/40 hover:text-terminal-highlight"
          aria-label="More options"
        >
          <MoreVertical class="w-3.5 h-3.5" />
        </button>

        <div 
          v-if="showMenu"
          class="absolute right-0 mt-6 w-32 bg-terminal-black border border-terminal-gray rounded-md shadow-xl z-50 py-1"
        >
          <button
            @click="handleDelete"
            class="w-full text-left px-3 py-1.5 text-[10px] text-error hover:bg-error/10 flex items-center gap-2 transition-colors font-medium"
          >
            <Trash2 class="w-3 h-3" />
            Delete Trade
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
