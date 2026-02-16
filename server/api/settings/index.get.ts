import { defineEventHandler } from 'h3'
import { getSettings } from '../../utils/settings'

export default defineEventHandler(async (event) => {
  const settings = await getSettings()
  // Return the full layout object
  return settings.chip_layout || { panels: [] }
})
