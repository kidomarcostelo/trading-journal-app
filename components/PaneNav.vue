<script setup lang="ts">
import { 
  LayoutDashboard, 
  FileText, 
  List as ListIcon, 
  Settings, 
  Moon, 
  Sun,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-vue-next'

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const toggleTheme = () => {
  // Force update by checking current value
  const current = colorMode.value
  const next = current === 'dark' ? 'light' : 'dark'
  console.log(`[Theme] Toggling from ${current} to ${next}`)
  colorMode.preference = next
}

defineProps<{
  activeTab: string
  collapsed?: boolean
}>()

defineEmits<{
  (e: 'update:activeTab', tab: string): void
  (e: 'toggle-collapse'): void
}>()
</script>

<template>
  <aside data-testid="pane-nav" class="w-full border-r border-terminal-gray flex flex-col bg-terminal-dark transition-all duration-300 min-h-0 overflow-hidden">
    <div 
      class="p-3 flex items-center border-b border-terminal-gray mb-1 overflow-hidden whitespace-nowrap flex-shrink-0"
      :class="collapsed ? 'justify-center px-2' : 'justify-between'"
    >
      <div class="flex items-center gap-3">
        <LayoutDashboard class="w-6 h-6 text-terminal-accent flex-shrink-0" />
        <span v-if="!collapsed" class="font-semibold text-terminal-highlight tracking-tight">Trading Journal</span>
      </div>
      
      <button 
        @click="$emit('toggle-collapse')"
        class="text-terminal-text/40 hover:text-terminal-highlight transition-colors p-1"
        :title="collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
      >
        <PanelLeftOpen v-if="collapsed" class="w-4 h-4" />
        <PanelLeftClose v-else class="w-4 h-4" />
      </button>
    </div>

    <nav class="flex-1 px-2 space-y-1 overflow-y-auto min-h-0 custom-scrollbar">
      <button 
        @click="$emit('update:activeTab', 'daily-report')"
        :class="['w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all overflow-hidden whitespace-nowrap', activeTab === 'daily-report' ? 'bg-terminal-gray text-terminal-highlight' : 'text-terminal-text/60 hover:bg-terminal-gray/30 hover:text-terminal-text', collapsed ? 'justify-center' : '']"
        title="Daily Report"
      >
        <FileText class="w-5 h-5 flex-shrink-0" />
        <span v-if="!collapsed" class="text-sm font-medium">Daily Report</span>
      </button>
      <button 
        @click="$emit('update:activeTab', 'daily-trades')"
        :class="['w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all overflow-hidden whitespace-nowrap', activeTab === 'daily-trades' ? 'bg-terminal-gray text-terminal-highlight' : 'text-terminal-text/60 hover:bg-terminal-gray/30 hover:text-terminal-text', collapsed ? 'justify-center' : '']"
        title="Daily Trades"
      >
        <ListIcon class="w-5 h-5 flex-shrink-0" />
        <span v-if="!collapsed" class="text-sm font-medium">Daily Trades</span>
      </button>
      <button 
        @click="$emit('update:activeTab', 'settings')"
        :class="['w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all overflow-hidden whitespace-nowrap', activeTab === 'settings' ? 'bg-terminal-gray text-terminal-highlight' : 'text-terminal-text/60 hover:bg-terminal-gray/30 hover:text-terminal-text', collapsed ? 'justify-center' : '']"
        title="Settings"
      >
        <Settings class="w-5 h-5 flex-shrink-0" />
        <span v-if="!collapsed" class="text-sm font-medium">Settings</span>
      </button>
    </nav>

    <div class="p-2 border-t border-terminal-gray flex-shrink-0">
      <button
        @click="toggleTheme"
        class="w-full flex items-center gap-3 px-3 py-2 text-terminal-text/60 hover:text-terminal-highlight transition-all overflow-hidden whitespace-nowrap"
        :class="collapsed ? 'justify-center' : ''"
        :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
      >
        <Moon v-if="isDark" class="w-5 h-5 flex-shrink-0" />
        <Sun v-else class="w-5 h-5 flex-shrink-0" />
        <span v-if="!collapsed" class="text-sm font-medium">{{ isDark ? 'Dark Mode' : 'Light Mode' }}</span>
      </button>
    </div>
  </aside>
</template>