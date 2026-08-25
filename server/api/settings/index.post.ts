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

  const config = typeof useRuntimeConfig === 'function' ? useRuntimeConfig() : ({} as any)
  const session = typeof getUserSession === 'function' ? await getUserSession(event) : null
  const isGuest = session?.user?.isGuest || session?.user?.email === 'guest@portfolio.demo'

  if (config?.demoMode || isGuest) {
    return { success: true }
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
