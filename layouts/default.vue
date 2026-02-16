<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useUI } from '~/composables/useUI'
import AppSidebar from '~/components/AppSidebar.vue'
import UiToastNotification from '~/components/ui/ToastNotification.vue'

const { startSidebarResize, stopSidebarResize, handleSidebarResize } = useUI()

onMounted(() => {
  window.addEventListener('mousemove', handleSidebarResize)
  window.addEventListener('mouseup', stopSidebarResize)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleSidebarResize)
  window.removeEventListener('mouseup', stopSidebarResize)
})
</script>

<template>
  <div class="h-dvh flex overflow-hidden bg-terminal-black text-terminal-text font-sans selection:bg-terminal-accent/30">
    <!-- Permanent Sidebar -->
    <AppSidebar />

    <!-- Sidebar Resize Handle -->
    <div 
      @mousedown.prevent="startSidebarResize"
      class="w-1 h-full cursor-col-resize hover:bg-terminal-accent/50 transition-colors z-20 flex-shrink-0 bg-terminal-gray/10"
    ></div>

    <!-- Page Content -->
    <div class="flex-1 flex overflow-hidden">
      <slot />
    </div>

    <!-- Global Notifications -->
    <UiToastNotification />
  </div>
</template>
