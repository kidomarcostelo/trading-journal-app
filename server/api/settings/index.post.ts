import { defineEventHandler, readBody, createError } from 'h3'
import { saveSettings } from '../../utils/settings'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Basic Validation
  if (!body || typeof body !== 'object') {
    throw createError({
        statusCode: 400,
        statusMessage: 'Invalid body'
    })
  }

  // Ensure structure
  const layout = {
    strategy: Array.isArray(body.strategy) ? body.strategy : [],
    psychology: Array.isArray(body.psychology) ? body.psychology : []
  }
  
  await saveSettings('chip_layout', layout)
  return { success: true }
})