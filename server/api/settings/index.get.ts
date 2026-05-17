import { defineEventHandler } from 'h3'
import { getSettings } from '../../utils/settings'

export default defineEventHandler(async (event) => {
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
