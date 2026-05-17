import { defineEventHandler, readBody, createError } from 'h3'
import { saveSettings } from '../../utils/settings'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body || typeof body !== 'object') {
    throw createError({
        statusCode: 400,
        statusMessage: 'Invalid body'
    })
  }

  // Allow saving an arbitrary key/value pair
  if (body.key && body.value !== undefined) {
    await saveSettings(body.key, body.value)
    return { success: true }
  }

  // Legacy fallback: Save the full body as chip_layout
  await saveSettings('chip_layout', body)
  
  return { success: true }
})
