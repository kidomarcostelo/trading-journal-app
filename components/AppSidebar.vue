<script setup lang="ts">
import { watch } from 'vue'
import { LogOut } from 'lucide-vue-next'
import { useUI } from '~/composables/useUI'
import PaneNav from '~/components/PaneNav.vue'

const { sidebarWidth, isSidebarCollapsed, activeTab, toggleSidebar } = useUI()
const { user, clear } = useUserSession()
const route = useRoute()

// Sync active tab based on route if necessary
watch(() => route.path, (path) => {
  if (path === '/settings') activeTab.value = 'settings'
  else if (path === '/analytics') activeTab.value = 'analytics'
  else if (path === '/dashboard' && (activeTab.value === 'settings' || activeTab.value === 'analytics')) {
    activeTab.value = 'daily-trades'
  }
}, { immediate: true })

const handleTabChange = (tab: string) => {
  activeTab.value = tab
  if (tab === 'settings') {
    navigateTo('/settings')
  } else if (tab === 'analytics') {
    navigateTo('/analytics')
  } else {
    navigateTo('/dashboard')
  }
}

const logout = async () => {
  await clear()
  navigateTo('/login')
}
</script>

<template>
  <div 
    :style="{ width: `${sidebarWidth}px` }" 
    class="flex-shrink-0 relative transition-[width] duration-0 ease-linear overflow-hidden bg-terminal-dark h-full flex flex-col"
  >
    <PaneNav 
      class="flex-1"
      :active-tab="activeTab" 
      :collapsed="isSidebarCollapsed"
      @update:active-tab="handleTabChange"
      @toggle-collapse="toggleSidebar"
    />
    
    <!-- User Section / Logout -->
    <div class="p-2 border-t border-terminal-gray bg-terminal-black/50 flex-shrink-0">
      <div v-if="!isSidebarCollapsed && (user?.isGuest || user?.email === 'guest@portfolio.demo')" class="px-2 py-1 mb-1.5">
        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-terminal-accent/10 text-terminal-accent border border-terminal-accent/20">
          <span class="w-1.5 h-1.5 rounded-full bg-terminal-accent animate-pulse"></span>
          Live Demo Sandbox
        </span>
      </div>

      <button 
        @click="logout"
        class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-rose-500/10 text-terminal-text/60 hover:text-rose-400 transition-all group"
        :class="isSidebarCollapsed ? 'justify-center' : ''"
        :title="isSidebarCollapsed ? 'Logout' : ''"
      >
        <LogOut class="w-5 h-5 group-hover:rotate-12 transition-transform" />
        <span v-if="!isSidebarCollapsed" class="text-sm font-medium truncate">{{ (user?.isGuest || user?.email === 'guest@portfolio.demo') ? 'Exit Demo' : (user?.email?.split('@')[0] || 'Logout') }}</span>
      </button>
    </div>
  </div>
</template>
