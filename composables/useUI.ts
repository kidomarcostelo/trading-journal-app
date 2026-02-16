import { ref, computed } from 'vue'

export const useUI = () => {
  const sidebarWidth = useState('sidebar-width', () => 64)
  const lastSidebarWidth = useState('last-sidebar-width', () => 256)
  const activeTab = useState('active-tab', () => 'daily-trades')
  const isResizingSidebar = useState('is-resizing-sidebar', () => false)

  const isSidebarCollapsed = computed(() => sidebarWidth.value < 100)

  const toggleSidebar = () => {
    if (isSidebarCollapsed.value) {
      sidebarWidth.value = Math.max(256, lastSidebarWidth.value)
    } else {
      lastSidebarWidth.value = sidebarWidth.value
      sidebarWidth.value = 64
    }
  }

  const startSidebarResize = () => {
    isResizingSidebar.value = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const stopSidebarResize = () => {
    isResizingSidebar.value = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  const handleSidebarResize = (e: MouseEvent) => {
    if (!isResizingSidebar.value) return
    let newWidth = Math.min(e.clientX, 400)
    if (newWidth < 150) {
      newWidth = 64
    } else {
      lastSidebarWidth.value = newWidth
    }
    sidebarWidth.value = newWidth
  }

  return {
    sidebarWidth,
    isSidebarCollapsed,
    activeTab,
    toggleSidebar,
    startSidebarResize,
    stopSidebarResize,
    handleSidebarResize
  }
}
