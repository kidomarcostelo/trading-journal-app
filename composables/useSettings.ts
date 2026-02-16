export const useSettings = () => {
  const settings = useState('settings-layout', () => ({
    panels: [] as { id: string, title: string, categories: string[] }[]
  }))
  
  const isLoading = useState('settings-loading', () => false)
  const error = useState<any>('settings-error', () => null)

  const fetchSettings = async () => {
    isLoading.value = true
    error.value = null
    try {
      const data = await $fetch<any>('/api/settings')
      if (data) {
        // Migration logic: convert old strategy/psychology keys to new panels array
        if (data.strategy || data.psychology) {
          const migratedPanels = []
          if (data.strategy) migratedPanels.push({ id: 'strategy-' + Date.now(), title: 'Strategy & Tags', categories: data.strategy })
          if (data.psychology) migratedPanels.push({ id: 'psychology-' + Date.now(), title: 'Psychology', categories: data.psychology })
          settings.value = { panels: migratedPanels }
        } else {
          settings.value = data
        }
      }
    } catch (e) {
      error.value = e
      console.error('Failed to fetch settings:', e)
    } finally {
      isLoading.value = false
    }
  }

  const saveSettings = async () => {
    isLoading.value = true
    error.value = null
    try {
      await $fetch('/api/settings', {
        method: 'POST',
        body: settings.value
      })
    } catch (e) {
      error.value = e
      console.error('Failed to save settings:', e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const updateLayout = (newLayout: { strategy: string[], psychology: string[] }) => {
    settings.value = newLayout
  }

  return {
    settings,
    isLoading,
    error,
    fetchSettings,
    saveSettings,
    updateLayout
  }
}
