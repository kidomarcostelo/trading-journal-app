export const useSettings = () => {
  const settings = useState('settings-layout', () => ({
    strategy: [] as string[],
    psychology: [] as string[]
  }))
  
  const isLoading = useState('settings-loading', () => false)
  const error = useState<any>('settings-error', () => null)

  const fetchSettings = async () => {
    isLoading.value = true
    error.value = null
    try {
      const data = await $fetch<{ strategy: string[], psychology: string[] }>('/api/settings')
      if (data) {
        settings.value = data
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
