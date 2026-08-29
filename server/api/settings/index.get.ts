import { defineEventHandler } from 'h3'
import { getSettings } from '../../utils/settings'
import { DEFAULT_MOCK_SETTINGS } from '../../utils/mockData'

export default defineEventHandler(async (event) => {
  const config = typeof useRuntimeConfig === 'function' ? useRuntimeConfig() : ({} as any)
  const session = typeof getUserSession === 'function' ? await getUserSession(event) : null
  const isGuest = session?.user?.isGuest || session?.user?.email === 'guest@portfolio.demo'
  const isDemo = config?.demoMode || isGuest
  const spreadsheetId = isDemo ? (config?.demoSpreadsheetId || config?.googleSpreadsheetId) : (config?.googleSpreadsheetId || config?.demoSpreadsheetId)

  let settings: any = {}
  try {
    if (spreadsheetId) {
      settings = await getSettings(spreadsheetId)
    } else {
      settings = JSON.parse(JSON.stringify(DEFAULT_MOCK_SETTINGS))
    }
  } catch (err: any) {
    if (isDemo) {
      settings = JSON.parse(JSON.stringify(DEFAULT_MOCK_SETTINGS))
    } else {
      throw err
    }
  }
  
  // Ensure defaults exist for expected keys
  if (!settings.chip_layout || !settings.chip_layout.panels) {
    settings.chip_layout = DEFAULT_MOCK_SETTINGS.chip_layout
  }
  if (!settings.strategyChecklists || Object.keys(settings.strategyChecklists).length === 0) {
    // Migration fallback if old format exists
    if (settings.checklistRules || settings.tierThresholds) {
      settings.strategyChecklists = {
        'Default': {
          rules: settings.checklistRules || [],
          tiers: settings.tierThresholds || []
        }
      }
    } else {
      settings.strategyChecklists = DEFAULT_MOCK_SETTINGS.strategyChecklists
    }
  }
  
  return settings
})
