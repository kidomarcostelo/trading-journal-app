import { defineEventHandler } from 'h3'
import { getSettings } from '../../utils/settings'

export default defineEventHandler(async (event) => {
  const settings = await getSettings()
  
  // Ensure defaults exist for expected keys
  if (!settings.chip_layout) {
    settings.chip_layout = { panels: [] }
  }
  if (!settings.checklistRules) {
    settings.checklistRules = []
  }
  if (!settings.tierThresholds) {
    settings.tierThresholds = []
  }
  
  return settings
})
