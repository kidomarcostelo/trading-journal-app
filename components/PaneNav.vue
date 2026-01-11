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
}>()

defineEmits<{
  (e: 'update:activeTab', tab: string): void
  (e: 'toggle-theme'): void
}>()
</script>

<template>
  <aside data-testid="pane-nav" class="w-16 md:w-64 border-r border-terminal-gray flex flex-col bg-terminal-dark h-full">
    <div class="p-4 flex items-center gap-3 border-b border-terminal-gray mb-4">
      <LayoutDashboard class="w-6 h-6 text-terminal-accent" />
      <span class="hidden md:block font-semibold text-terminal-highlight tracking-tight">Journal</span>
    </div>

    <nav class="flex-1 px-2 space-y-1">
      <button 
        @click="$emit('update:activeTab', 'daily-report')"
        :class="['w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all', activeTab === 'daily-report' ? 'bg-terminal-gray text-terminal-highlight' : 'text-terminal-text/60 hover:bg-terminal-gray/30 hover:text-terminal-text']"
      >
        <FileText class="w-5 h-5" />
        <span class="hidden md:block text-sm font-medium">Daily Report</span>
      </button>
      <button 
        @click="$emit('update:activeTab', 'daily-trades')"
        :class="['w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all', activeTab === 'daily-trades' ? 'bg-terminal-gray text-terminal-highlight' : 'text-terminal-text/60 hover:bg-terminal-gray/30 hover:text-terminal-text']"
      >
        <ListIcon class="w-5 h-5" />
        <span class="hidden md:block text-sm font-medium">Daily Trades</span>
      </button>
      <button 
        @click="$emit('update:activeTab', 'settings')"
        :class="['w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all', activeTab === 'settings' ? 'bg-terminal-gray text-terminal-highlight' : 'text-terminal-text/60 hover:bg-terminal-gray/30 hover:text-terminal-text']"
      >
        <Settings class="w-5 h-5" />
        <span class="hidden md:block text-sm font-medium">Settings</span>
      </button>
    </nav>

    <div class="p-4 border-t border-terminal-gray">
      <button
        @click="$emit('toggle-theme')"
        class="w-full flex items-center gap-3 px-3 py-2 text-terminal-text/60 hover:text-terminal-highlight transition-all"
      >
        <Moon v-if="isDark" class="w-5 h-5" />
        <Sun v-else class="w-5 h-5" />
        <span class="hidden md:block text-sm font-medium">{{ isDark ? 'Dark Mode' : 'Light Mode' }}</span>
      </button>
    </div>
  </aside>
</template>