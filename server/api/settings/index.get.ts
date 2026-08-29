import { defineEventHandler } from 'h3'
import { getSettings } from '../../utils/settings'
import { DEFAULT_MOCK_SETTINGS } from '../../utils/mockData'

export default defineEventHandler(async (event) => {
  const config = typeof useRuntimeConfig === 'function' ? useRuntimeConfig() : ({} as any)
  const session = typeof getUserSession === 'function' ? await getUserSession(event) : null
  const isGuest = session?.user?.isGuest || session?.user?.email === 'guest@portfolio.demo'

  if (config?.demoMode || isGuest) {
    if (config?.demoSpreadsheetId) {
      try {
        const demoSettings = await getSettings(config.demoSpreadsheetId)
        if (demoSettings && Object.keys(demoSettings).length > 0) {
          if (!demoSettings.chip_layout) {
            demoSettings.chip_layout = DEFAULT_MOCK_SETTINGS.chip_layout
          }
          if (!demoSettings.strategyChecklists) {
            demoSettings.strategyChecklists = DEFAULT_MOCK_SETTINGS.strategyChecklists
          }
          return demoSettings
        }
      } catch (e) {
        // Fallback to mock settings
      }
    }
    return JSON.parse(JSON.stringify(DEFAULT_MOCK_SETTINGS))
  }

  const settings = await getSettings()
  
  // Ensure defaults exist for expected keys
  if (!settings.chip_layout) {
    settings.chip_layout = { panels: [] }
  }
  if (!settings.strategyChecklists) {
    // Migration fallback if old format exists
    if (settings.checklistRules || settings.tierThresholds) {
      settings.strategyChecklists = {
        'Default': {
          rules: settings.checklistRules || [],
          tiers: settings.tierThresholds || []
        }
      }
    } else {
      settings.strategyChecklists = {}
    }
  }
  
  return settings
})
