<script setup lang="ts">
import { 
  LayoutDashboard, 
  FileText, 
  List as ListIcon, 
  Settings, 
  Moon, 
  Sun 
} from 'lucide-vue-next'

defineProps<{
  activeTab: string
  isDark: boolean
  collapsed?: boolean
}>()

defineEmits<{
  (e: 'update:activeTab', tab: string): void
  (e: 'toggle-theme'): void
}>()
</script>

<template>
  <aside data-testid="pane-nav" class="w-full border-r border-terminal-gray flex flex-col bg-terminal-dark h-full transition-all duration-300">
    <div 
      class="p-4 flex items-center gap-3 border-b border-terminal-gray mb-4 overflow-hidden whitespace-nowrap"
      :class="collapsed ? 'justify-center px-2' : ''"
    >
      <LayoutDashboard class="w-6 h-6 text-terminal-accent flex-shrink-0" />
      <span v-if="!collapsed" class="font-semibold text-terminal-highlight tracking-tight">Trading Journal</span>
    </div>

    <nav class="flex-1 px-2 space-y-1">
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

    <div class="p-4 border-t border-terminal-gray">
      <button
        @click="$emit('toggle-theme')"
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