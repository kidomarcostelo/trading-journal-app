import { defineEventHandler } from 'h3'
import { getSettings } from '../../utils/settings'

export default defineEventHandler(async (event) => {
  const settings = await getSettings()
  // Ensure default structure if key is missing or malformed
  const layout = settings.chip_layout || { strategy: [], psychology: [] }
  
  // Ensure both keys exist even if saved object was partial
  return {
    strategy: Array.isArray(layout.strategy) ? layout.strategy : [],
    psychology: Array.isArray(layout.psychology) ? layout.psychology : []
  }
})