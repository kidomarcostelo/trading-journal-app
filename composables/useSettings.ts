import type { ChecklistRule, TierThreshold } from '../types'

export const useSettings = () => {
  const settings = useState('settings-layout', () => ({
    panels: [] as { id: string, title: string, categories: string[] }[]
  }))
  
  const checklistRules = useState<ChecklistRule[]>('settings-checklist-rules', () => [])
  const tierThresholds = useState<TierThreshold[]>('settings-tier-thresholds', () => [])
  
  const isLoading = useState('settings-loading', () => false)
  const error = useState<any>('settings-error', () => null)

  const fetchSettings = async () => {
    isLoading.value = true
    error.value = null
    try {
      const data = await $fetch<any>('/api/settings')
      if (data) {
        // Migration logic for old chip_layout or if data is the old layout itself
        const layoutData = data.chip_layout || data
        
        if (layoutData.strategy || layoutData.psychology) {
          const migratedPanels = []
          if (layoutData.strategy) migratedPanels.push({ id: 'strategy-' + Date.now(), title: 'Strategy & Tags', categories: layoutData.strategy })
          if (layoutData.psychology) migratedPanels.push({ id: 'psychology-' + Date.now(), title: 'Psychology', categories: layoutData.psychology })
          settings.value = { panels: migratedPanels }
        } else {
          settings.value = layoutData.panels ? layoutData : { panels: [] }
        }
        
        if (data.checklistRules) checklistRules.value = data.checklistRules
        if (data.tierThresholds) tierThresholds.value = data.tierThresholds
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
      // Save specifically as chip_layout using the new key/value format
      await $fetch('/api/settings', {
        method: 'POST',
        body: { key: 'chip_layout', value: settings.value }
      })
    } catch (e) {
      error.value = e
      console.error('Failed to save settings:', e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const saveChecklistConfig = async (rules: ChecklistRule[], tiers: TierThreshold[]) => {
    isLoading.value = true
    error.value = null
    try {
      await $fetch('/api/settings', { method: 'POST', body: { key: 'checklistRules', value: rules } })
      await $fetch('/api/settings', { method: 'POST', body: { key: 'tierThresholds', value: tiers } })
      checklistRules.value = rules
      tierThresholds.value = tiers
    } catch (e) {
      error.value = e
      console.error('Failed to save checklist config:', e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const updateLayout = (newLayout: { strategy: string[], psychology: string[] } | { panels: any[] }) => {
    settings.value = newLayout as any
  }

  return {
    settings,
    checklistRules,
    tierThresholds,
    isLoading,
    error,
    fetchSettings,
    saveSettings,
    saveChecklistConfig,
    updateLayout
  }
}
