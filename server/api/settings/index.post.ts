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

  // Save the full settings object (including panels array with titles)
  await saveSettings('chip_layout', body)
  
  return { success: true }
})
